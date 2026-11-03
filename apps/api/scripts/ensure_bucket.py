"""Development helper: create the private storage bucket if it does not exist.

Used by the `storage-init` compose service. Production buckets are provisioned by infrastructure
code with public access blocked; the app never creates buckets at runtime.
"""

from botocore.exceptions import ClientError

from app.core.config import get_settings
from app.core.storage import get_s3_client

if __name__ == "__main__":
    bucket = get_settings().s3_bucket
    client = get_s3_client()
    try:
        client.head_bucket(Bucket=bucket)
        print(f"bucket {bucket} exists")
    except ClientError:
        client.create_bucket(Bucket=bucket)
        print(f"bucket {bucket} created (private)")
