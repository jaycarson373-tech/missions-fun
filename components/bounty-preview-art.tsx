// Original monochrome route diagrams for closed community briefs.
export default function BountyPreviewArt({kind}: {kind: string}) {
  return <svg className="bounty-preview-art" viewBox="0 0 280 104" fill="none" aria-hidden="true">
    <path d="M0 26H280M0 52H280M0 78H280M35 0V104M70 0V104M105 0V104M140 0V104M175 0V104M210 0V104M245 0V104" stroke="currentColor" opacity=".08"/>
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'jump' && <>
        <path d="M16 83H82L106 66M178 66H204L230 83H264" opacity=".45"/>
        <path d="M72 65Q141 -10 207 61" strokeDasharray="4 6" opacity=".6"/>
        <g transform="translate(119 31) rotate(-12)"><path d="M0 14L8 3H31L42 14H48V26H-6V17Z" fill="#28252f"/><path d="M10 5V14H32L28 5"/><circle cx="4" cy="26" r="5" fill="#17151d"/><circle cx="37" cy="26" r="5" fill="#17151d"/></g>
        <path d="M197 73L203 79L216 65"/>
      </>}
      {kind === 'route' && <>
        <path d="M30 78H85Q97 78 97 66V34Q97 22 109 22H166Q179 22 179 35V65Q179 78 192 78H247" strokeWidth="18" opacity=".1"/>
        <path d="M30 78H85Q97 78 97 66V34Q97 22 109 22H166Q179 22 179 35V65Q179 78 192 78H247" strokeDasharray="4 6" opacity=".65"/>
        <circle cx="30" cy="78" r="5" fill="currentColor"/><path d="M247 69V87M241 69H253M241 87H253"/>
        <path d="M123 10H149V34H123Z" fill="#28252f"/><path d="M128 15H144M128 29H144"/>
      </>}
      {kind === 'zone' && <>
        <path d="M54 17H226V88H54Z" strokeDasharray="5 5" opacity=".55"/>
        <path d="M80 36H191V68H113V51H160" opacity=".45"/>
        <path d="M77 68H94M85 60V76"/><path d="M164 47L177 52L164 58L167 52Z" fill="currentColor"/>
        <circle cx="174" cy="52" r="24" opacity=".2"/><circle cx="174" cy="52" r="34" opacity=".12"/>
      </>}
      {kind === 'timer' && <>
        <circle cx="140" cy="58" r="32" opacity=".6"/><path d="M131 16H149M140 16V25M165 30L172 23M140 58L157 43"/>
        <circle cx="140" cy="58" r="3" fill="currentColor"/><path d="M140 32V36M114 58H118M162 58H166M140 80V84" opacity=".6"/>
        <path d="M52 45H88M35 58H83M60 71H88M193 45H224M199 58H245M193 71H219" opacity=".3"/>
      </>}
    </g>
  </svg>;
}
