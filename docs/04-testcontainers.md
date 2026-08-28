# TestcontainersでMySQL 9.7の結合テストを実行する

Testcontainersは、テストコードからコンテナを起動し、テスト終了後に破棄するライブラリです。

この実習では、Javaアプリケーションが新しいMySQL 9.7に接続し、テーブル作成、データ書き込み、データ読み取りを実行します。

最後にJUnitが読み取った値を判定します。

テストは実行のたびにMySQLコンテナを作成します。

ローカルに常設したMySQLや固定の`localhost:3306`には接続しません。

## この実習で確認すること

この実習では、常設の開発用MySQLではなく、テストコードが起動したMySQLに対してSQLを実行します。

テストは次の処理を行います。

1. Mavenが`TodoRepositoryIT`を起動する。
2. TestcontainersがPodman経由でMySQLコンテナを起動する。
3. テストコードが動的に割り当てられた接続先へ接続する。
4. `todo`表を作成し、`Testcontainers lab`という1行を追加する。
5. 追加した行を`SELECT`し、値が一致することをJUnitで検証する。
6. テストコードの終了時にコンテナを終了する。

このサンプルでは、Composeと同じOracle Container RegistryのMySQL Community Server 9.7イメージを使います。

## テストを実行する

`pom.xml`は`*IT.java`をテスト対象に含める設定です。

そのため、`mvn test`だけで`TodoRepositoryIT`を実行できます。

```bash
cd testcontainers-java

export DOCKER_HOST="unix://${XDG_RUNTIME_DIR}/podman/podman.sock"
export TESTCONTAINERS_RYUK_DISABLED=true

mvn test
```

特定のテストだけを明示して実行する場合は、次のコマンドを使います。

```bash
mvn -Dtest=TodoRepositoryIT test
```

Javaソースを編集した後に、確実に再コンパイルしたい場合は`target/`だけを削除して実行します。

```bash
mvn clean -Dtest=TodoRepositoryIT test
```

## 実行ログを確認する

成功時には、次のようなログが表示されます。

```text
[INFO] MySQL image: container-registry.oracle.com/mysql/community-server:9.7
[OK] MySQL Server version: 9.7.3
[OK] CREATE TABLE todo
[OK] INSERT todo: 1 row
[OK] SELECT todo: id=1, title=Testcontainers lab
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

`MySQL image`は、Testcontainersへ指定したコンテナイメージです。

`MySQL Server version`は、コンテナ内で`SELECT VERSION()`を実行した結果です。

`CREATE TABLE`、`INSERT`、`SELECT`は、それぞれSQLが成功したことを示します。

`Failures: 0`は、JUnitの期待値とSQLの実行結果が一致したことを示します。

`Errors: 0`は、MySQLの起動失敗、接続失敗、SQL実行時の例外がなかったことを示します。

`BUILD SUCCESS`まで表示されれば、結合テストは成功です。

`SLF4J: Failed to load class ... StaticLoggerBinder`は、ログ実装が未設定であることを示す警告です。

`BUILD SUCCESS`であれば、テストの成否には影響していません。

## もう一度実行する

同じコマンドを続けてもう一度実行します。

```bash
mvn -Dtest=TodoRepositoryIT test
```

2回とも成功すれば、前回の`todo`表やデータを利用せず、毎回新しいMySQLでテストできていることを確認できます。

テストコードは[`TodoRepositoryIT.java`](../testcontainers-java/src/test/java/example/TodoRepositoryIT.java)です。

コンテナ起動やDB接続に失敗した場合は、Podmanソケットの場所、Podmanサービスの起動状態、Oracle Container Registryへの到達性を確認します。

CIへ移す場合は、ランナーがDocker API互換ランタイムとコンテナレジストリへ到達できることを確認してください。

## 参考資料

- [Testcontainers for Java MySQL Module](https://java.testcontainers.org/modules/databases/mysql/)
- [Testcontainers for Java: Supported Docker Environment](https://java.testcontainers.org/supported_docker_environment/)
