const Icon = ({ d, size = 20, stroke = 1.6, fill = "none", style }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
  >
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
)

export const Icons = {
  Home:    (p) => <Icon {...p} d="M3 11l9-7 9 7M5 10v10h14V10" />,
  Grid:    (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></>} />,
  Wallet:  (p) => <Icon {...p} d={<><path d="M3 7c0-1.1.9-2 2-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M16 12h3"/><path d="M3 10h16"/></>} />,
  Users:   (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c0-2.3 1.7-4 4-4"/></>} />,
  Menu:    (p) => <Icon {...p} d={<><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/></>} />,
  Bell:    (p) => <Icon {...p} d="M6 8a6 6 0 1112 0c0 5 2 6 2 7H4c0-1 2-2 2-7zM10 20a2 2 0 004 0" />,
  Search:  (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/></>} />,
  Plus:    (p) => <Icon {...p} d={<><path d="M12 5v14"/><path d="M5 12h14"/></>} />,
  Check:   (p) => <Icon {...p} d="M5 12l4 4 10-10" />,
  Broom:   (p) => <Icon {...p} d={<><path d="M14 4l6 6"/><path d="M4 20l7-7 4 4-7 7H4v-4z"/><path d="M5 19l2-2M9 15l2-2"/></>} />,
  Wrench:  (p) => <Icon {...p} d="M14 7a4 4 0 105 5l4 4-2 2-4-4a4 4 0 01-5-5l-5-5-2 2z" />,
  Calendar:(p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>} />,
  Trend:   (p) => <Icon {...p} d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  Dots:    (p) => <Icon {...p} d={<><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></>} />,
  Clock:   (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
  Key:     (p) => <Icon {...p} d={<><circle cx="8" cy="14" r="4"/><path d="M11 12l10-10M17 6l3 3M15 8l2 2"/></>} />,
  Door:    (p) => <Icon {...p} d={<><path d="M6 3h12v18H6z"/><circle cx="14" cy="12" r="0.8" fill="currentColor"/></>} />,
  Arrow:   (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />,
  Back:    (p) => <Icon {...p} d="M19 12H5M12 5l-7 7 7 7" />,
  Sliders: (p) => <Icon {...p} d={<><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--paper)"/><circle cx="16" cy="12" r="2" fill="var(--paper)"/><circle cx="10" cy="18" r="2" fill="var(--paper)"/></>} />,
}
