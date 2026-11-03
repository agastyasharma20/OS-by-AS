"""Write the OpenAPI schema to stdout so packages/api-client can be generated from it."""

import json
import sys

from app.core.config import Settings
from app.main import create_app

if __name__ == "__main__":
    app = create_app(Settings(env="development"))
    json.dump(app.openapi(), sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
