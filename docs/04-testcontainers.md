# Testcontainersで結合テストを実行する

Testcontainersは、テストコードからコンテナを起動し、テスト終了後に破棄するライブラリです。

この実習では、Javaアプリケーションが新しいMySQLに接続して、テーブル作成、データ書き込み、データ読み取りまで成功することを確認します。

テストは実行のたびにMySQLコンテナを作成します。

ローカルに常設したMySQLや固定の`localhost:3306`には接続しません。

## この実習で確認すること

この実習では、常設の開発用MySQLではなく、テストコードが起動したMySQLに対してSQLを実行します。

テストは次の処理を行います。

1. TestcontainersがPodman経由でMySQLコンテナを起動する。
2. テストコードが動的に割り当てられた接続先へ接続する。
3. `todo`表を作成し、`Testcontainers lab`という1行を追加する。
4. 追加した行を`SELECT`し、値が一致することをJUnitで検証する。
5. テストコードの終了時にコンテナを終了する。

`mvn test`を続けて2回実行して、両方が成功することを確認します。

これは、前回の実行で残った`todo`表やデータを使わずに、同じ結合テストを繰り返せることの確認です。

このサンプルでは、Composeと同じOracle Container RegistryのMySQL Community Server 9.7イメージを使います。

```bash
cd testcontainers-java
export DOCKER_HOST="unix://${XDG_RUNTIME_DIR}/podman/podman.sock"
export TESTCONTAINERS_RYUK_DISABLED=true
mvn test
```

成功時には、`Tests run: 1`、`Failures: 0`、`Errors: 0`と`BUILD SUCCESS`が表示されます。

テストコード自身の出力として、次の2行も表示されます。

```text
[OK] Testcontainers started MySQL: jdbc:mysql://...
[OK] INSERT and SELECT verified: Testcontainers lab
```

1行目はテストコードがMySQLコンテナを起動したことを示します。

2行目はテストコードが書き込んだデータを読み戻し、期待した値と一致したことを示します。

続けて同じコマンドをもう一度実行します。

```bash
mvn test
```

2回とも成功すれば、テストの開始時に新しいMySQLを用意し、テスト終了後に破棄する流れを確認できます。

テストコードは[`TodoRepositoryIT.java`](../testcontainers-java/src/test/java/example/TodoRepositoryIT.java)です。

コンテナ起動やDB接続に失敗した場合は、Podmanソケットの場所、Podmanサービスの起動状態、Oracle Container Registryへの到達性を確認します。

CIへ移す場合は、ランナーがDocker API互換ランタイムとコンテナレジストリへ到達できることを確認してください。
