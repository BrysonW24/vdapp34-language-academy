"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  getLanguageConfig,
  getLanguageFromPathname,
  getLanguageSwitchHref,
  getPathWithoutLanguage,
  langHref,
  languageHasSurface,
  pathnameHasLanguage,
  SUPPORTED_LANGUAGES,
  type LanguageSurface,
} from "@/lib/languages"
import {
  Compass,
  BookOpen,
  Globe,
  Languages,
  MessageSquare,
  GraduationCap,
  Clock,
  Shapes,
  Menu,
  X,
  ChevronDown,
} from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: typeof Compass
  /**
   * If set, this nav item only renders when the current language config
   * includes the named surface. The home/Start item (empty href) has no
   * surface gate and always renders.
   */
  surface?: LanguageSurface
}

const MAIN_NAV: NavItem[] = [
  { href: "", label: "Start", icon: Compass },
  { href: "words", label: "1000 Words", icon: BookOpen, surface: "words" },
  { href: "topics", label: "Topics", icon: Globe, surface: "topics" },
  { href: "grammar", label: "Grammar", icon: Languages, surface: "grammar" },
  { href: "phrases", label: "Phrases", icon: MessageSquare, surface: "phrases" },
  { href: "practice", label: "Practice", icon: GraduationCap, surface: "practice" },
]

const MORE_PAGES: NavItem[] = [
  { href: "guides", label: "Visual Guides", icon: Shapes, surface: "guides" },
  { href: "timeline", label: "Your Timeline", icon: Clock, surface: "timeline" },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const hasLanguageInPath = pathnameHasLanguage(pathname)
  const currentLang = getLanguageFromPathname(pathname)
  const currentLanguage = getLanguageConfig(currentLang)!
  const currentPath = getPathWithoutLanguage(pathname)

  const visibleNav = (items: NavItem[]) =>
    items.filter((item) => !item.surface || languageHasSurface(currentLang, item.surface))

  const mainNav = visibleNav(MAIN_NAV)
  const moreNav = visibleNav(MORE_PAGES)

  const isMoreActive = moreNav.some((item) =>
    item.href ? currentPath === item.href || currentPath.startsWith(`${item.href}/`) : currentPath === ""
  )

  return (
    <header className="fixed top-0 left-0 right-0 sm:top-[18px] sm:left-[18px] sm:right-[18px] z-50 rounded-none sm:rounded-[18px] border-b sm:border border-[rgba(44,49,59,0.08)] bg-[rgba(255,252,247,0.78)] backdrop-blur-[16px] shadow-editorial-soft">
      <div className="container flex h-14 items-center justify-between">
        <Link href={hasLanguageInPath ? langHref(currentLang) : "/"} className="flex items-center gap-2.5">
          <div
            className="relative h-8 w-8 rounded-[11px] flex items-center justify-center shadow-sm ring-1 ring-black/5"
            style={{ background: "linear-gradient(140deg, #4c8369 0%, #386a58 46%, #2c5343 100%)" }}
          >
            {hasLanguageInPath ? (
              <span className="text-[15px] leading-none" aria-hidden="true">{currentLanguage.flag}</span>
            ) : (
              <Languages className="h-[17px] w-[17px] text-white" strokeWidth={2.1} />
            )}
          </div>
          <div className="hidden sm:block">
            <span className="block font-serif text-lg font-semibold text-editorial-ink leading-tight">Language Academy</span>
            <span className="block text-[11px] leading-none text-editorial-muted">
              {hasLanguageInPath ? currentLanguage.name : "Twelve languages, one academy"}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {hasLanguageInPath ? (
            <>
              {mainNav.map((item) => {
                const Icon = item.icon
                const href = langHref(currentLang, item.href)
                const isActive = item.href === ""
                  ? currentPath === ""
                  : currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.label}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200",
                      isActive
                        ? "text-editorial-ink bg-white/80 border border-[rgba(44,49,59,0.1)] shadow-sm"
                        : "text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}

              {moreNav.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-all duration-200",
                      isMoreActive
                        ? "text-editorial-ink bg-white/80 border border-[rgba(44,49,59,0.1)] shadow-sm"
                        : "text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                    )}
                  >
                    More
                    <ChevronDown className={cn("h-3 w-3 transition-transform", moreOpen && "rotate-180")} />
                  </button>
                  {moreOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-[16px] border border-[rgba(44,49,59,0.08)] bg-[rgba(255,252,247,0.95)] backdrop-blur-[20px] shadow-editorial p-2 space-y-0.5">
                        {moreNav.map((item) => {
                          const Icon = item.icon
                          const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                          return (
                            <Link
                              key={item.label}
                              href={langHref(currentLang, item.href)}
                              onClick={() => setMoreOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm transition-all duration-200",
                                isActive
                                  ? "text-editorial-ink bg-white/80 shadow-sm"
                                  : "text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="ml-3 pl-3 border-l border-[rgba(44,49,59,0.08)] flex items-center gap-1">
                <Link
                  href="/"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-200 text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                  title="Back to language home"
                  aria-label="Back to language home"
                >
                  <span aria-hidden="true">🏠</span>
                </Link>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const language = getLanguageConfig(lang)!
                  const isActive = lang === currentLang
                  return (
                    <Link
                      key={lang}
                      href={getLanguageSwitchHref(pathname, lang)}
                      className={cn(
                        "rounded-full px-2.5 py-1.5 text-xs transition-all duration-200",
                        isActive
                          ? "text-editorial-ink bg-white/80 border border-[rgba(44,49,59,0.1)] shadow-sm"
                          : "text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                      )}
                      title={`Switch to ${language.name}`}
                    >
                      <span className="hidden xl:inline">
                        <span aria-hidden="true">{language.flag}</span> {language.name}
                      </span>
                      <span className="xl:hidden" aria-hidden="true">{language.flag}</span>
                    </Link>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const language = getLanguageConfig(lang)!
                return (
                  <Link
                    key={lang}
                    href={langHref(lang)}
                    className="rounded-full px-3 py-1.5 text-sm text-editorial-muted transition-all duration-200 hover:text-editorial-ink hover:bg-white/50"
                  >
                    <span className="hidden xl:inline">
                      <span aria-hidden="true">{language.flag}</span> {language.name}
                    </span>
                    <span className="xl:hidden" aria-hidden="true">{language.flag}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-[10px] hover:bg-white/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-[rgba(44,49,59,0.08)] p-3 space-y-0.5 max-h-[70vh] overflow-y-auto">
          {hasLanguageInPath && (
            <>
              <p className="text-[10px] uppercase tracking-[0.18em] text-editorial-muted px-3 py-1">Learn</p>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-sm text-editorial-muted transition-all duration-200 hover:text-editorial-ink hover:bg-white/50"
                aria-label="Back to language home"
              >
                <span aria-hidden="true">🏠</span>
                <span>Language home</span>
              </Link>
              {mainNav.map((item) => {
                const Icon = item.icon
                const isActive = item.href === ""
                  ? currentPath === ""
                  : currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.label}
                    href={langHref(currentLang, item.href)}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "text-editorial-ink bg-white/74 shadow-sm"
                        : "text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              {moreNav.length > 0 && (
                <>
                  <div className="h-px bg-[rgba(44,49,59,0.08)] mx-3 my-2" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-editorial-muted px-3 py-1">More</p>
                </>
              )}
              {moreNav.map((item) => {
                const Icon = item.icon
                const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.label}
                    href={langHref(currentLang, item.href)}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "text-editorial-ink bg-white/74 shadow-sm"
                        : "text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              <div className="h-px bg-[rgba(44,49,59,0.08)] mx-3 my-2" />
            </>
          )}
          <p className="text-[10px] uppercase tracking-[0.18em] text-editorial-muted px-3 py-1">
            {hasLanguageInPath ? "Switch language" : "Choose a language"}
          </p>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const language = getLanguageConfig(lang)!
            const isActive = lang === currentLang
            return (
              <Link
                key={lang}
                href={hasLanguageInPath ? getLanguageSwitchHref(pathname, lang) : langHref(lang)}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-[14px] px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "text-editorial-ink bg-white/74 shadow-sm"
                    : "text-editorial-muted hover:text-editorial-ink hover:bg-white/50"
                )}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">{language.flag}</span>
                  {language.name}
                </span>
                <span className="text-xs">
                  {hasLanguageInPath && !isActive ? "Keep section" : language.shortCode}
                </span>
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
