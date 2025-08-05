# bun-file-server

A lightweight and fast file server built with Bun that allows you to serve and share files over your local network. Based on the Python http.server module.

## Usage

```bash
# Serve current directory
bunx bun-file-server

# Serve specific directory
bunx bun-file-server /path/to/directory

# Serve specific port
bunx bun-file-server -p 3001
```

The server will start on port 3000 by default. You can access it at:

- Local: http://localhost:3000
- Network: http://your-ip-address:3000

---

This project requires the [Bun](https://bun.sh) runtime.
