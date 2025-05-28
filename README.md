# CloudAutoDeploy Service

## Workflow Concept

1. **Upload**  
   - User uploads a single archive (`.zip` or `.tar.gz`) via a file-upload form.

2. **Validation**  
   - Server extracts the archive and checks for either:
     - `Dockerfile` (if “Docker” mode selected)  
     - `docker-compose.yml` (if “Docker-Compose” mode selected)  
   - If the required file is missing, reject the request with HTTP 400 and an error message.

3. **Mode & Parameters**  
   - User selects deployment mode: `docker` or `docker-compose`.  
   - User enters a **name** for the deployment and any **environment variables** or runtime flags.

4. **Provisioning & Deployment**  
   - Server uses your AWS credentials (from config) to **provision** or **reuse** an EC2 Free-Tier instance.  
   - Server pushes the project to EC2 via **EC2 UserData** (for S3-backed archives) or **SSH/SCP** (using `Paramiko`).  
   - Runs either `docker run …` or `docker-compose up -d`.

5. **Result & Feedback**  
   - **<span style="color:#4BB543;">On success</span>**:
     - Return a deployment object containing:  
       - Deployment **status** (`Running`/`Pending`/`Stopped`)  
       - **Real-time log** feed endpoint (WebSocket URL)  
       - Public **IP** or **domain**  
   - **<span style="color:#D6706E;">On failure</span>**:  
     - Return HTTP 500 with deployment error logs.

6. **Lifecycle Controls**  
   - Via REST API commands (`POST /action/{app_id}`), user can `start`, `stop`, or `terminate` the deployment at any time.  
   - Status is continuously updated (or polled) via `GET /status/{app_id}` and WebSocket log stream.