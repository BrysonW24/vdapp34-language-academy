import { describe, expect, it } from "vitest"
import { readdirSync, existsSync } from "fs"
import { join } from "path"

const appRoot = join(__dirname, "..")

describe("vdapp34-language-academy smoke tests", () => {
  it("package.json is valid JSON", () => {
    const packageJson = require(join(appRoot, "package.json"))
    expect(packageJson.name).toBeDefined()
    expect(packageJson.scripts).toBeDefined()
  })

  it("has required npm scripts", () => {
    const packageJson = require(join(appRoot, "package.json"))
    expect(packageJson.scripts.dev).toBeDefined()
    expect(packageJson.scripts.build).toBeDefined()
    expect(packageJson.scripts.lint).toBeDefined()
  })

  it("src directory exists", () => {
    const srcPath = join(appRoot, "src")
    expect(existsSync(srcPath)).toBe(true)
  })

  it("content directory exists for language academy content", () => {
    const contentPath = join(appRoot, "content")
    expect(existsSync(contentPath)).toBe(true)
  })

  it("all content JSON files parse correctly", () => {
    const contentPath = join(appRoot, "content")
    if (!existsSync(contentPath)) return

    const contentFiles = readdirSync(contentPath, { recursive: true }).filter(
      (file) => typeof file === "string" && file.endsWith(".json")
    )

    contentFiles.forEach((file) => {
      const filePath = join(contentPath, file as string)
      const content = require(filePath)
      expect(content).toBeDefined()
    })
  })

  it("tsconfig.json exists and is valid", () => {
    const tsconfigPath = join(appRoot, "tsconfig.json")
    expect(existsSync(tsconfigPath)).toBe(true)
    const tsconfig = require(tsconfigPath)
    expect(tsconfig.compilerOptions).toBeDefined()
  })
})
