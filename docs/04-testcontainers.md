# Testcontainersで結合テストを実行する

Testcontainersは、テストコードからコンテナを起動し、テスト終了後に破棄するライブラリです。

この実習ではJavaの例を使います。

```bash
cd testcontainers-java
export DOCKER_HOST="unix://${XDG_RUNTIME_DIR}/podman/podman.sock"
export TESTCONTAINERS_RYUK_DISABLED=true
mvn test
```

テストの開始時にMySQLコンテナを作成し、終了時に破棄します。

固定の`localhost:3306`は使わず、`getJdbcUrl()`で接続先を取得します。

CIへ移す場合は、ランナーがDocker API互換ランタイムとコンテナレジストリへ到達できることを確認してください。
