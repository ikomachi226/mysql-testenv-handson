# 事前準備

Oracle Linux 9の検証用Computeを1台作成します。

NSGまたはSecurity Listでは、実習PCのIPアドレスからのTCP/22だけを許可します。

MySQLのClassic Protocol、X Protocol、Group Replicationのポートを外部公開しません。

SSHで接続した後、PodmanとCompose互換コマンドを導入します。

```bash
sudo dnf update -y
sudo dnf install -y python3-pip //必要に応じてインストール
sudo dnf install -y git curl unzip podman podman-docker podman-compose

podman --version
podman compose version || podman-compose --version
```

Testcontainersを使うため、rootless PodmanのAPIソケットを有効にします。

```bash
systemctl --user enable --now podman.socket
export DOCKER_HOST="unix://${XDG_RUNTIME_DIR}/podman/podman.sock"
export TESTCONTAINERS_RYUK_DISABLED=true
```

この環境変数は、そのシェルでTestcontainersを実行する間だけ必要です。

Docker Engineを組織標準として使う場合は、Docker ComposeとDocker APIを利用しても構いません。
