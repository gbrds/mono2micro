# Kubernetes setup for mono2micro blog

This directory contains Kubernetes manifests for running the microservices and React frontend in a cluster (e.g. Minikube with nginx ingress).

## Services
- **posts-srv** (port 3001) handles creation of posts via `POST /posts/create` and emits events.
- **comments-srv** (port 3002) manages comments under `POST /posts/:id/comments` and `GET /posts/:id/comments`.
- **query-srv** (port 3004) aggregates posts + comments, available at `GET /posts`.
- **event-srv** (port 3003) internal event bus (ClusterIP only).
- **moderation-srv** (port 3005) internal moderation logic (ClusterIP only).
- **client-srv** (port 3000) frontend React application exposing `/` and static assets.

All backend services are `ClusterIP`; only the `client-ingress` resource is exposed externally.

## Ingress
Two ingress resources are defined in `ingress-backend.yaml`:

1. **backend-ingress** routes API calls under `blog.local` to the appropriate ClusterIP services.
2. **client-ingress** routes non-API paths to the React SPA and rewrites requests to `/`.

**Important:** the hostname `blog.local` should resolve to your Minikube IP (e.g. add to `/etc/hosts`).

```
# example (Linux/Mac)
echo "$(minikube ip) blog.local" | sudo tee -a /etc/hosts
```

Then enable the nginx ingress addon and apply manifests:

```sh
minikube addons enable ingress
kubectl apply -f infra/k8s
```

Access the app at http://blog.local/ once the pods are ready.

---

This README is purely informational; you can adjust paths or ports as needed.