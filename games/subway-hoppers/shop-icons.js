const paths={
 magnet:'<path d="M8 7v12a8 8 0 0 0 16 0V7h-5v12a3 3 0 0 1-6 0V7z" fill="#87d8f5"/><path d="M8 7h5v5H8zm11 0h5v5h-5z" fill="#f1fbff"/>',
 shield:'<path d="m16 3 11 4v9c0 7-11 13-11 13S5 23 5 16V7z" fill="#65bfe9" stroke="#c6f1ff" stroke-width="2"/><path d="M16 6v19" stroke="#e8faff" opacity=".6"/>',
 double:'<path d="m9 4 7 8-7 8-7-8z" fill="#8bddfa"/><text x="15" y="25" font-family="Arial" font-size="15" font-weight="bold" fill="#ecfaff">×2</text>',
 save:'<path d="M7 11a11 11 0 1 1-1 12" fill="none" stroke="#9de4fa" stroke-width="4" stroke-linecap="round"/><path d="M5 4v10h10" fill="none" stroke="#9de4fa" stroke-width="3"/>',
 head:'<path d="m7 6 10 10L7 26m10-20 10 10-10 10" fill="none" stroke="#a8e9ff" stroke-width="4" stroke-linejoin="round"/>',
 powers:'<path d="m18 2-12 17h9l-1 11 13-19h-9z" fill="#9de4fa"/>',
 toast:'<path d="M7 28V13C0 5 10 1 16 5 23 1 32 6 25 13v15z" fill="#dbac6d" stroke="#f4d3a0" stroke-width="1.5"/><path d="M10 14h12v10H10z" fill="#543022"/>',
 burger:'<path d="M4 13C4 0 28 0 28 13zM4 24h24v5H4z" fill="#e9ba71"/><path d="M3 17h26M4 22h24" stroke="#9ed088" stroke-width="4"/><path d="M4 20h24" stroke="#764736" stroke-width="4"/>',
 beer:'<path d="M6 3h6v8l3 4v15H3V15l3-4zm14 0h6v8l3 4v15H17V15l3-4z" fill="#e4b956"/><path d="M4 19h10v6H4zm14 0h10v6H18z" fill="#f2eed9"/>',
 skins:'<path d="m10 4-8 6 5 8 3-2v13h12V16l3 2 5-8-8-6c-1 6-11 6-12 0" fill="#91d2ef"/>'
};
export function shopIcon(id){return '<svg data-power-icon="'+id+'" viewBox="0 0 32 32" aria-hidden="true" focusable="false">'+(paths[id]||paths.powers)+'</svg>';}
