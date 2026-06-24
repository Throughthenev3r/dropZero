locals {
  handlers = {
    health = {
      handler   = "src/handlers/health.handler"
      route_key = "GET /health"
    }
    shorten = {
      handler   = "src/handlers/shorten.handler"
      route_key = "POST /api/shorten"
    }
    stats = {
      handler   = "src/handlers/stats.handler"
      route_key = "GET /api/stats/{code}"
    }
    delete = {
      handler   = "src/handlers/delete.handler"
      route_key = "DELETE /api/links/{code}"
    }
    redirect = {
      handler   = "src/handlers/redirect.handler"
      route_key = "GET /{code}"
    }
  }

  common_tags = {
    Project = var.project_name
    Managed = "terraform"
  }
}
