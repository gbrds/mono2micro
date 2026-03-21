# mono2micro Blog – API & URL Reference

This document collects all of the important endpoints, service names and URLs used across the micro‑services and the React frontend.

## Backend services
Each service runs on a fixed port and is referenced by its Kubernetes `Service` name when calling from other services inside the cluster.

| Service         | Internal Service Name | Port | Key Routes (mounted)                    | Description                             |
|-----------------|-----------------------|------|------------------------------------------|-----------------------------------------|
| posts           | `posts-srv`           | 3001 | `GET  /posts`<br>`GET /posts/:id`<br>`POST /posts/create` | Manage posts; emits `PostCreated` events to event bus. |
| comments        | `comments-srv`        | 3002 | `GET  /posts/:id/comments`<br>`POST /posts/:id/comments` | Add/read comments for a post; emits `CommentCreated`. |
| query           | `query-srv`           | 3004 | `GET  /posts`                             | Aggregates posts+comments, used by frontend. |
| event bus       | `event-srv`           | 3003 | `POST /events`                            | Internal only; forwards events to all services. |
| moderation      | `moderation-srv`      | 3005 | `POST /events`                            | Internal only; listens for `CommentCreated` and emits `CommentModerated`. |

Each service also exposes a simple `/events` endpoint for diagnostics (and called by ingress in dev).

### Inter‑service calls
- **posts** → event bus: `http://event-srv:3003/events`<br>
- **comments** → posts: `http://posts-srv:3001/posts/:id`<br>
- **comments** → event bus: `http://event-srv:3003/events`<br>
- **event** → posts, comments, query, moderation (see event/index.js)
- **moderation** → event bus: `http://event-srv:3003/events` (to emit moderation results)

> All internal calls use `http://<service-name>:<port>` so DNS from Kubernetes resolves them.

## Kubernetes ingress
Ingress rules are defined in `infra/k8s/ingress-backend.yaml`.  There are two resources
under the `blog.local` host:

1. **backend-ingress** – handles API traffic
    - `POST /posts/create` → `posts-srv:3001`
    - `POST /posts/[0-9]+/comments` → `comments-srv:3002`
    - `GET /posts` → `query-srv:3004`

2. **client-ingress** – catches everything else and forwards to the React SPA (`client-srv:3000`) with a
   rewrite to `/` to support client-side routing.

> To use these rules add `blog.local` to your hosts file pointing at the cluster IP (e.g. Minikube IP).

When running outside Kubernetes (e.g. via `docker-compose`), the services listen on the same ports on
`localhost` – but the frontend has been updated to use **relative** paths so the ingress host/port is not
hard-coded.

## Frontend fetch URLs
All network requests originating from `client/src` use relative URLs:

- Fetch post list: `GET /posts`
- Create a post: `POST /posts/create`  (body: `{ title, content }`)
- Read single post + comments: the app fetches `/posts` and filters by id
- Add a comment: `POST /posts/:id/comments` (body: `{ content }`)

These match the ingress definitions above. When the browser hits `http://blog.local/` the requests are
routed by nginx to the appropriate backend service.

## Useful build & run commands

### Docker (client)
```sh
# from repository root
cd client
docker build -t gbrds/client:latest .
docker run --rm -p 5005:5005 gbrds/client:latest
```

### Kubernetes (Minikube)
```sh
minikube addons enable ingress
# ensure blog.local points at minikube IP
echo "$(minikube ip) blog.local" | sudo tee -a /etc/hosts
kubectl apply -f infra/k8s
kubectl rollout status deployment/posts-depl
```

### Local development (docker-compose)
```sh
docker-compose up --build
```

The above commands are primarily for reference; the repository’s existing `docker-compose.yml` and
`infra/k8s` manifests cover service definitions.

---

This README centralizes the URLs and endpoints used throughout the project.  Keep it up to date when
adding new routes or changing service ports.  If you deploy the app in a different environment the
`host` value in the ingress and/or the frontend fetch logic may need to change accordingly.