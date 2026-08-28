# 実習環境の片付け

Composeで作成したコンテナと実習用volumeを削除します。

```bash
cd compose
podman compose down -v
```

SandboxはMySQL Shellから`dba.deleteSandboxInstance()`で削除します。

検証用Computeを残す理由がなければ、OCIコンソールで終了します。

対象を確認せずに、他プロジェクトのvolumeやSandboxを削除しないでください。
