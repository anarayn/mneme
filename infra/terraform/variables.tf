variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region for KMS and S3"
  type        = string
  default     = "us-east-1"
}

variable "gcp_project" {
  description = "GCP project ID for Cloud Run workers"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}
