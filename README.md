# MySQL検証環境ハンズオン on OCI

Docker Compose、MySQL Shell Sandbox、Testcontainersを使い分けるための、日本語ハンズオンです。

OCI Compute上に3種類のMySQL検証環境を作ります。

|目的|方法|ディレクトリ|
|---|---|---|
|アプリケーションとMySQLを一緒に開発する|Compose|[`compose/`](compose/)|
|複数MySQLとInnoDB Clusterを試す|MySQL Shell Sandbox|[`sandbox/`](sandbox/)|
|テストごとに新しいDBを使う|Testcontainers|[`testcontainers-java/`](testcontainers-java/)|

## 実習の順番

1. [事前準備](docs/01-prerequisites.md)
2. [Composeで公式MySQLイメージを起動する](docs/02-compose.md)
3. [Sandboxで3ノードのInnoDB Clusterを作る](docs/03-sandbox.md)
4. [Testcontainersで結合テストを実行する](docs/04-testcontainers.md)
5. [実習環境を削除する](docs/05-cleanup.md)

本番データ、個人情報、実運用の認証情報を持ち込まないでください。

## 前提

- OCIを利用できること
- Oracle Linux 9（x86_64）の検証用ComputeにSSHで接続できること
- MySQLの3306番、Sandboxの3310番などをインターネットに公開しないこと

MySQL Community Serverは、Oracle Container Registryの公式イメージを固定タグで利用します。

```text
container-registry.oracle.com/mysql/community-server:9.7
```

Communityイメージの取得にログインは不要です。

Enterprise Editionを使う場合は、Oracle Container Registryで利用条件に同意し、Oracleアカウントでログインしてください。

## リポジトリ構成

```text
.
├── compose/                 # 共有する開発用MySQL
├── sandbox/                 # MySQL Shellの実行例
├── testcontainers-java/     # Javaの結合テスト例
└── docs/                    # OCI準備から片付けまでの手順
```

## 公式資料

- [MySQL Dockerコンテナの基本手順](https://dev.mysql.com/doc/refman/9.7/en/docker-mysql-getting-started.html)
- [MySQL Shell Sandbox](https://dev.mysql.com/doc/mysql-shell/9.7/en/deploy-sandbox-instances.html)
- [Testcontainers MySQL module](https://java.testcontainers.org/modules/databases/mysql/)
