# ADR 0007 — Development object storage: RustFS instead of MinIO

Status: Accepted · Date: 2026-11-03

## Context
The roadmap named MinIO for local S3-compatible storage. During Phase 1 the `minio/minio` and
`minio/mc` repositories were no longer available on Docker Hub (MinIO stopped publishing community
images in 2025), so a clean clone could not start.

## Decision
Use **RustFS** (`rustfs/rustfs`, Apache-2.0, S3-compatible) in development and CI. A one-shot
`storage-init` service (reusing the API image and boto3) creates the private bucket.

## Consequences
- The API only speaks the S3 API through boto3, so switching providers is a configuration change.
- Production uses AWS S3 (ADR 0006); RustFS is never exposed publicly.
