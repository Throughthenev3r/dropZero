resource "null_resource" "package_lambda" {
  triggers = {
    package_json = filemd5("${path.module}/../package.json")
    handlers     = join(",", [for filename in fileset("${path.module}/../src/handlers", "*.js") : filemd5("${path.module}/../src/handlers/${filename}")])
    services     = join(",", [for filename in fileset("${path.module}/../src/services", "*.js") : filemd5("${path.module}/../src/services/${filename}")])
    db           = filemd5("${path.module}/../src/db/dynamodb.js")
    utils        = join(",", [for filename in fileset("${path.module}/../src/utils", "*.js") : filemd5("${path.module}/../src/utils/${filename}")])
  }

  provisioner "local-exec" {
    command     = "npm run package:lambda"
    working_dir = "${path.module}/.."
  }
}

data "archive_file" "lambda_zip" {
  depends_on = [null_resource.package_lambda]

  type        = "zip"
  source_dir  = "${path.module}/../.lambda-package"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  tags          = local.common_tags
}

resource "aws_lambda_function" "handlers" {
  for_each = local.handlers

  function_name = "${var.project_name}-${each.key}"
  role          = aws_iam_role.lambda.arn
  handler       = each.value.handler
  runtime       = "nodejs22.x"
  architectures = ["x86_64"]
  timeout       = 10
  memory_size   = 256

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      LINKS_TABLE          = aws_dynamodb_table.links.name
      CLICK_EVENTS_TABLE   = aws_dynamodb_table.click_events.name
      BASE_URL             = aws_apigatewayv2_api.main.api_endpoint
      LINK_TTL_DAYS        = tostring(var.link_ttl_days)
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
    }
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_integration" "handlers" {
  for_each = local.handlers

  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.handlers[each.key].invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "handlers" {
  for_each = local.handlers

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.value.route_key
  target    = "integrations/${aws_apigatewayv2_integration.handlers[each.key].id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
  tags        = local.common_tags
}

resource "aws_lambda_permission" "handlers" {
  for_each = local.handlers

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handlers[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
