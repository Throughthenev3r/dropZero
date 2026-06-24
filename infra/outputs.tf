output "api_url" {
  description = "Public HTTP API URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "links_table" {
  description = "DynamoDB links table name"
  value       = aws_dynamodb_table.links.name
}

output "click_events_table" {
  description = "DynamoDB click events table name"
  value       = aws_dynamodb_table.click_events.name
}

output "lambda_functions" {
  description = "Deployed Lambda function names"
  value       = { for key, fn in aws_lambda_function.handlers : key => fn.function_name }
}
