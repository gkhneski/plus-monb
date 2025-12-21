"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, FileText, Users, Sparkles, User, Building2, Settings, LogOut, ChevronRight, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, user } = useAuth()

  const menuItems = [
    { path: "/online-calendar", label: "Online Kalender", icon: Calendar },
    { path: "/buchungen", label: "Buchungen", icon: FileText },
    { path: "/kunden", label: "Kunden", icon: Users },
    { path: "/behandlungen", label: "Behandlungen", icon: Sparkles },
    { path: "/mitarbeiter", label: "Mitarbeiter", icon: User },
    { path: "/filialen", label: "Filialen", icon: Building2 },
    { path: "/einstellungen", label: "Einstellungen", icon: Settings },
  ]

  const isActive = (path: string) => pathname === path || (pathname?.startsWith(path + "/") ?? false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (e) {
      console.error("Logout error:", e)
    }
  }

  return (
    <>
      {/* Overlay (nur mobil) */}
      {open && (
        <button aria-label="Sidebar schließen" onClick={onClose} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-[280px] shrink-0",
          "bg-white text-black",
          "border-r border-gray-200",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto",
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-black" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-base font-normal truncate">Booking Pro</div>
                <div className="text-xs text-gray-500 truncate font-light">Management System</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User */}
          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-3">
            <div className="text-sm font-normal truncate">{user?.email ?? "—"}</div>
            <div className="text-xs text-gray-500 font-light">Administrator</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-2 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={[
                      "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
                      "transition-colors",
                      active ? "bg-gray-100 border border-gray-200" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span
                        className={[
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          active ? "bg-gray-200" : "bg-gray-50 group-hover:bg-gray-100",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4 text-black" />
                      </span>
                      <span className="font-normal truncate text-[15px]">{item.label}</span>
                    </span>

                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-4 w-4 text-black" />
            <span className="font-normal text-[15px]">Abmelden</span>
          </button>
        </div>
      </aside>
    </>
  )
}
