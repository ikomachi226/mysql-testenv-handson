# Testcontainersで結合テストを実行する

Testcontainersは、テストコードからコンテナを起動し、テスト終了後に破棄するライブラリです。

この実習では、Javaアプリケーションが新しいMySQLに接続して、テーブル作成、データ書き込み、データ読み取りまで成功することを確認します。

テストは実行のたびにMySQLコンテナを作成します。

ローカルに常設したMySQLや固定の`localhost:3306`には接続しません。

## この実習で確認すること

- PodmanのDocker API互換ソケット経由で、TestcontainersがMySQL公式イメージを起動できること
- テストコードが`getJdbcUrl()`から取得した動的な接続先へ接続できること
- 空の`labdb`で`todo`表を作成し、1行を書き込んで読み戻せること
- `mvn test`を続けて2回実行しても両方成功すること

最後の確認は、前回のテストの表や行に依存していないことを示します。

このサンプルでは、Composeと同じOracle Container RegistryのMySQL Community Server 9.7イメージを使います。

```bash
cd testcontainers-java
export DOCKER_HOST="unix://${XDG_RUNTIME_DIR}/podman/podman.sock"
export TESTCONTAINERS_RYUK_DISABLED=true
mvn test
```

成功時には、Mavenの最後に`BUILD SUCCESS`が表示されます。

続けて同じコマンドをもう一度実行します。

```bash
mvn test
```

2回とも成功すれば、テストの開始時に新しいMySQLを用意し、テスト終了後に破棄する流れを確認できます。

テストコードは[`TodoRepositoryIT.java`](../testcontainers-java/src/test/java/example/TodoRepositoryIT.java)です。

コンテナ起動やDB接続に失敗した場合は、Podmanソケットの場所、Podmanサービスの起動状態、Oracle Container Registryへの到達性を確認します。

CIへ移す場合は、ランナーがDocker API互換ランタイムとコンテナレジストリへ到達できることを確認してください。
