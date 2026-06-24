resource "aws_dynamodb_table" "links" {
  name         = "${var.project_name}-links"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "code"

  attribute {
    name = "code"
    type = "S"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = local.common_tags
}

resource "aws_dynamodb_table" "click_events" {
  name         = "${var.project_name}-click-events"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "code"
  range_key    = "clicked_at"

  attribute {
    name = "code"
    type = "S"
  }

  attribute {
    name = "clicked_at"
    type = "S"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = local.common_tags
}
