terraform {
  required_version = ">= 1.9"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket = "mneme-terraform-state"
    key    = "infra/terraform.tfstate"
    region = "us-east-1"
  }
}

# ─── AWS (KMS, S3, IAM) ────────────────────────────────────────────────────────

provider "aws" {
  region = var.aws_region
}

# Master KMS key — wraps per-user DEKs
resource "aws_kms_key" "mneme_master" {
  description             = "MNEME master key for envelope encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Service     = "mneme"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "mneme_master" {
  name          = "alias/mneme-master"
  target_key_id = aws_kms_key.mneme_master.key_id
}

# S3 bucket for encrypted document vault
resource "aws_s3_bucket" "mneme_vault" {
  bucket = "mneme-vault-${var.environment}"

  tags = {
    Service     = "mneme"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "mneme_vault" {
  bucket = aws_s3_bucket.mneme_vault.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "mneme_vault" {
  bucket = aws_s3_bucket.mneme_vault.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.mneme_master.arn
      sse_algorithm     = "aws:kms"
    }
  }
}
