# 🏷️ GitTAG

**Universal Tag Database for GitPLC / GitHMI / GitSCADA**

ISA-95 compliant tag namespace. Browse, create, edit tags via GitHub
Issues. The repo IS the tag provider — UDTs define structure, Issues
hold runtime values, Pages app is the tag browser/editor.

## Structure

```
TAG/
├── pages/              GitHub Pages app (tag browser + editor)
│   ├── ui/             Dark theme + layout
│   ├── engine/         Tag DB, UDT resolver, namespace tree, issue sync
│   ├── views/          Browser, editor, tree, search, bulk import
│   ├── editors/        Inline tag value editors (numeric, bool, enum, string)
│   └── assets/         ISA-95 namespace icons, quality badges
├── providers/          Tag provider definitions
│   ├── github.json     GitHub Issues provider config
│   ├── opcua.json      OPC-UA server mapping
│   └── ignition.json   Ignition gateway binding
├── namespaces/         ISA-95 namespace templates
│   ├── enterprise.json
│   ├── site.json
│   ├── area.json
│   └── equipment.json
├── index.html          Redirect → pages/
└── README.md
```

## How It Works

1. **UDTs from GitPLC** define tag structure (motor, valve, PID, etc.)
2. **GitHub Issues** with `gittag` label are tag instances
3. **Namespace tree** follows ISA-95: Enterprise → Site → Area → Equipment
4. **Tag browser** reads + renders the full tag tree
5. **Tag editor** creates/updates Issues via GitHub API
6. **Providers** sync tags to OPC-UA, Ignition, MQTT
