# Blog Microservices

A full-stack blog application built as a microservices system running on Kubernetes. Supports creating posts, adding comments, event-driven moderation, JWT authentication, HTTPS, and live API documentation via Swagger UI.

---

## Services

| Service | Port | Description |
|---|---|---|
| `posts-srv` | 3001 | Create blog posts |
| `comments-srv` | 3002 | Add comments to posts |
| `query-srv` | 3004 | Aggregated read model (posts + comments) |
| `moderation-srv` | 3005 | Auto-moderates comments via events |
| `event-bus` | 3003 | Routes events between services |
| `auth-srv` | 5006 | JWT login, refresh, logout, verify |
| `client-srv` | 3000 | React frontend |
| `swagger-ui` | 80 | API documentation |

---

## Architecture

All inter-service communication is event-driven through the event bus:

```
posts-srv      → PostCreated       → event-bus → query-srv
comments-srv   → CommentCreated    → event-bus → moderation-srv
moderation-srv → CommentModerated  → event-bus → query-srv
```

External traffic enters through a single **Ingress NGINX** gateway over HTTPS.

---

## Prerequisites

- Docker Desktop
- Minikube
- kubectl
- Node.js 18+
- Git Bash (for openssl on Windows)

---

## First-Time Setup

```bash
# Start Minikube and enable Ingress
minikube start
minikube addons enable ingress

# Generate self-signed TLS certificate (Git Bash on Windows)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt -subj "//CN=blog.local"

# Store cert as Kubernetes secret
kubectl create secret tls blog-tls --cert=tls.crt --key=tls.key

# Load Swagger API spec
kubectl create configmap api-docs --from-file=openapi.yaml -n default

# Deploy all services
kubectl apply -f infra/k8s/
```

**Add to hosts file** (as Administrator on Windows — `C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1    blog.local
```

---

## Daily Start

```bash
minikube start
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80 8443:443
```

Keep the port-forward terminal open while using the app.

---

## Accessing the App

| URL | What |
|---|---|
| `https://blog.local:8443` | React frontend |
| `https://blog.local:8443/docs/` | Swagger UI (API docs) |

> The browser will show a certificate warning — expected for a self-signed cert. Click through to proceed.

---

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ | Login, returns JWT token |
| `POST` | `/auth/refresh` | ❌ | Refresh existing token |
| `POST` | `/auth/logout` | ❌ | Logout |
| `GET` | `/auth/verify` | ✅ | Verify token (used internally) |

**Login credentials (dummy user):**
```json
{ "username": "admin", "password": "password123" }
```

**Login response:**
```json
{ "token": "<jwt>" }
```

### Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/posts/create` | ❌ | Create a new post |
| `GET` | `/posts` | ✅ JWT | Get all posts with comments |

**Create post body:**
```json
{ "title": "My post", "content": "Hello world" }
```

### Comments

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/posts/:id/comments` | ❌ | Get comments for a post |
| `POST` | `/posts/:id/comments` | ✅ JWT | Add a comment to a post |

**Add comment body:**
```json
{ "content": "Great post!" }
```

**Comment statuses:** `pending` → `approved` or `rejected`
> Comments containing the word `orange` are automatically rejected by the moderation service.

---

## Using JWT in Postman

1. `POST https://blog.local:8443/auth/login` with credentials
2. Copy the `token` from the response
3. On protected requests add header:
   ```
   Authorization: Bearer <token>
   ```

## Using JWT in Swagger UI

1. Open `https://blog.local:8443/docs/`
2. Click **Authorize**
3. Enter `Bearer <token>` and confirm

---

## Rebuilding a Service

After code changes:

```bash
docker build -t <dockerhub-user>/<service> ./<service>
docker push <dockerhub-user>/<service>
kubectl rollout restart deployment/<service>-depl
```

Check logs after restart:
```bash
kubectl logs deployment/<service>-depl
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `blog.local` not reachable | Port-forward not running | Run port-forward command |
| `404 Not Found` | Wrong path or Ingress misconfigured | `kubectl describe ingress blog-ingress` |
| `401 Unauthorized` | Missing or expired token | Re-login via `/auth/login` |
| `500 Internal Server Error` | Event bus unreachable | Check service name is `event-srv` not `events-srv` |
| `502 Bad Gateway` | Pod crashed | `kubectl logs deployment/<n>-depl` |
| Swagger shows Petstore | ConfigMap issue | Check CRLF in `openapi.yaml`, recreate configmap |
