variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Prefix for resource names"
  type        = string
  default     = "url-shortener"
}

variable "link_ttl_days" {
  description = "Days before links are auto-deleted by DynamoDB TTL"
  type        = number
  default     = 30
}
