// If using CodePen JS panel, set JS preprocessor to "Babel".

// Otherwise place this inside <script type="text/babel"> in HTML.

const { useState, useEffect } = React;

/* Simple localStorage keys */

const LS = { USERS: 'sw_users_cp', SESSION: 'sw_session_cp', REPORTS: 'sw_reports_cp' };

/* Seed demo data */

function seed() {

  if (!localStorage.getItem(LS.USERS)) {

    const users = [

      { username: 'admin', password: 'admin', displayName: 'Administrator', isAdmin: true },

      { username: 'demo', password: 'demo', displayName: 'Demo User', isAdmin: false }

    ];

    localStorage.setItem(LS.USERS, JSON.stringify(users));

  }

  if (!localStorage.getItem(LS.REPORTS)) {

    const demoReports = [

      // example approved

      { id: 1, title: 'Modus Transfer Palsu', name: 'Akun Penipu', phone: '08123456789', description: 'Meminta transfer dengan bukti palsu', img: '', status: 'approved', submittedBy: 'demo', ts: new Date().toISOString() }

    ];

    localStorage.setItem(LS.REPORTS, JSON.stringify(demoReports));

  }

}

seed();

function getUsers(){ return JSON.parse(localStorage.getItem(LS.USERS) || '[]'); }

function getReports(){ return JSON.parse(localStorage.getItem(LS.REPORTS) || '[]'); }

function saveReports(list){ localStorage.setItem(LS.REPORTS, JSON.stringify(list)); }

function App(){

  const [session, setSession] = useState(JSON.parse(localStorage.getItem(LS.SESSION) || 'null'));

  const [route, setRoute] = useState('home'); // home, notif, you, admin

  const [reports, setReports] = useState(getReports());

  const [searchMode, setSearchMode] = useState('name'); // name / phone

  const [query, setQuery] = useState('');

  const [showUpload, setShowUpload] = useState(false);

  useEffect(()=> {

    localStorage.setItem(LS.SESSION, JSON.stringify(session));

  }, [session]);

  useEffect(()=> {

    setReports(getReports());

  }, []);

  function login(username, password){

    const u = getUsers().find(x => x.username === username && x.password === password);

    if(u){ setSession({ username: u.username, displayName: u.displayName, isAdmin: u.isAdmin }); return true; }

    return false;

  }

  function logout(){ setSession(null); localStorage.removeItem(LS.SESSION); }

  function submitReport({ title, name, phone, description, imgBase64 }){

    if(!session){ alert('Silakan login terlebih dahulu'); return; }

    const r = { id: Date.now(), title, name, phone, description, img: imgBase64, status: 'pending', submittedBy: session.username, ts: new Date().toISOString() };

    const all = [r, ...getReports()];

    saveReports(all); setReports(all); setShowUpload(false);

    alert('Laporan dikirim. Menunggu persetujuan admin.');

  }

  function adminApprove(id){ if(!session?.isAdmin) return; const all = getReports().map(r => r.id===id?{...r, status:'approved'}:r); saveReports(all); setReports(all); }

  function adminReject(id){ if(!session?.isAdmin) return; const all = getReports().map(r => r.id===id?{...r, status:'removed'}:r); saveReports(all); setReports(all); }

  const filtered = reports.filter(r => {

    if(!query) return true;

    if(searchMode==='name') return (r.name||'').toLowerCase().includes(query.toLowerCase()) || (r.title||'').toLowerCase().includes(query.toLowerCase());

    return (r.phone||'').toLowerCase().includes(query.toLowerCase());

  });

  return (

    <div className="min-h-screen bg-[#0f1721] text-gray-200 flex flex-col">

      {/* Top search bar */}

      <header className="p-4 bg-[#111827] flex items-center gap-4 sticky top-0 z-10">

        <div className="font-semibold text-lg">ScamWatch</div>

        <div className="flex items-center gap-2 bg-[#0b1220] p-2 rounded-md flex-1">

          <select value={searchMode} onChange={e=>setSearchMode(e.target.value)} className="bg-transparent text-sm outline-none">

            <option value="name">Nama</option>

            <option value="phone">No. Telepon</option>

          </select>

          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={searchMode==='name' ? 'Cari nama atau judul...' : 'Cari nomor telepon...'} className="flex-1 bg-transparent px-3 py-1 text-sm outline-none" />

          <button onClick={()=>{}} className="bg-indigo-600 px-3 py-1 rounded text-sm">Cari</button>

        </div>

        <div className="ml-3">

          {session ? (

            <div className="flex items-center gap-3">

              <div className="text-sm">{session.displayName}</div>

              <button onClick={logout} className="bg-red-600 px-3 py-1 rounded text-sm">Logout</button>

            </div>

          ) : (

            <LoginInline onLogin={(u,p)=>{ if(login(u,p)){ alert('Login berhasil'); } else alert('Gagal login'); }} />

          )}

        </div>

      </header>

      <main className="flex-1 p-4 overflow-auto">

        {route==='home' && (

          <>

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl font-semibold">Home</h2>

              <div className="flex gap-2">

                <button onClick={()=> setShowUpload(true)} className="bg-red-600 px-4 py-2 rounded-full">Upload</button>

                {session?.isAdmin && <button onClick={()=> setRoute('admin')} className="bg-gray-700 px-3 py-2 rounded">Admin</button>}

              </div>

            </div>

            <div className="space-y-4">

              {filtered.length===0 && <div className="text-gray-400">Tidak ada laporan.</div>}

              {filtered.map(r => (

                <Card key={r.id} report={r} onClick={()=>{}} />

              ))}

            </div>

            <div className="mt-8 text-sm text-gray-400">

              <h3 className="font-semibold text-gray-200">Tentang situs</h3>

              <p className="mt-2">Website ini dibuat sebagai pusat informasi modus penipuan (scam) untuk membantu mengurangi jumlah penipuan di Indonesia. Jika Anda merasa data Anda tersebar padahal Anda tidak melakukan tindakan ilegal, hubungi admin agar data Anda dapat diklarifikasi dan dibersihkan.</p>

              <p className="mt-2">Kontak Admin: Instagram <strong>@pirmanww</strong> (atau DM). Admin akan memberikan instruksi dan syarat pembersihan data.</p>

              <p className="mt-2 text-yellow-300">Catatan: ini prototype. Untuk penanganan hukum, hubungi pihak berwajib.</p>

            </div>

          </>

        )}

        {route==='notif' && (

          <div>

            <h2 className="text-xl font-semibold mb-3">Notifications</h2>

            <div className="text-gray-400">Notifikasi akan muncul di sini. (Contoh: laporan Anda disetujui)</div>

          </div>

        )}

        {route==='you' && (

          <div>

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">{session?session.displayName[0]:'U'}</div>

              <div>

                <div className="font-semibold text-lg">{session?session.displayName:'Tamu'}</div>

                <div className="text-sm text-gray-400">{session?session.username:'Belum login'}</div>

              </div>

            </div>

            <div className="mt-6 space-y-3">

              <div className="bg-[#0b1220] p-4 rounded-md">

                <div className="text-sm">Jika Anda yakin tidak melakukan aksi ilegal tetapi data Anda tersebar, hubungi Admin via IG <strong>@pirmanww</strong> atau DM. Admin akan memberikan instruksi dan syarat yang dibutuhkan untuk proses pembersihan data.</div>

              </div>

            </div>

          </div>

        )}

        {route==='admin' && (

          <div>

            <h2 className="text-xl font-semibold mb-3">Admin Panel</h2>

            {!session?.isAdmin && <div className="text-yellow-300">Akses admin hanya untuk akun admin. Login sebagai admin.</div>}

            {session?.isAdmin && (

              <div className="space-y-3">

                <div className="font-medium">Pending Reports</div>

                {reports.filter(r=>r.status==='pending').length===0 && <div className="text-gray-400">Tidak ada pending.</div>}

                {reports.filter(r=>r.status==='pending').map(r=>(

                  <div key={r.id} className="bg-[#0b1220] p-3 rounded flex justify-between items-start">

                    <div>

                      <div className="font-semibold">{r.title} <span className="text-sm text-gray-400">({r.name})</span></div>

                      <div className="text-sm text-gray-400">{r.description}</div>

                    </div>

                    <div className="flex flex-col gap-2">

                      <button onClick={()=>adminApprove(r.id)} className="px-3 py-1 rounded bg-green-700 text-sm">Setuju</button>

                      <button onClick={()=>adminReject(r.id)} className="px-3 py-1 rounded bg-red-700 text-sm">Tolak</button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}

      </main>

      {/* Upload modal */}

      {showUpload && (

        <UploadModal onClose={()=>setShowUpload(false)} onSubmit={submitReport} />

      )}

      {/* Bottom nav */}

      <nav className="bg-[#0b1220] p-3 flex items-center justify-between">

        <div className="flex-1 flex items-center justify-center">

          <button onClick={()=>setRoute('home')} className="relative flex flex-col items-center text-sm">

            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

            <span>Home</span>

            <span className="absolute -top-2 -right-6 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">5k</span>

          </button>

        </div>

        <div className="flex-1 flex items-center justify-center">

          <button onClick={()=>setRoute('notif')} className="flex flex-col items-center text-sm">

            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 17H9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3v1M5 8c0 4-1 6-1 6h16s-1-2-1-6a7 7 0 1 0-14 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

            <span>Notifications</span>

          </button>

        </div>

        <div className="flex-1 flex items-center justify-center">

          <button onClick={()=>setRoute('you')} className="flex flex-col items-center text-sm relative">

            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

            <span>You</span>

            <span className="absolute -top-2 -left-2 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b1220]"></span>

          </button>

        </div>

      </nav>

    </div>

  );

}

/* Card component: image on top, below image description and phone (per request) */

function Card({ report }) {

  return (

    <div className="bg-[#0b1220] rounded-lg overflow-hidden shadow">

      {report.img ? (

        <img src={report.img} alt="bukti" className="w-full h-56 object-cover" />

      ) : (

        <div className="w-full h-56 bg-gray-700 flex items-center justify-center text-gray-400">No Image</div>

      )}

      <div className="p-3">

        <div className="flex items-center justify-between">

          <div>

            <div className="font-semibold">{report.title}</div>

            <div className="text-sm text-gray-400">Pelaku: {report.name || '-'}</div>

          </div>

          <div className={`text-xs px-2 py-1 rounded ${report.status==='pending' ? 'bg-yellow-700 text-yellow-100' : report.status==='approved' ? 'bg-green-800 text-green-100' : 'bg-gray-700 text-gray-300'}`}>

            {report.status}

          </div>

        </div>

        <div className="mt-3 text-sm text-gray-300">{report.description}</div>

        <div className="mt-3 text-sm text-gray-200">

          <div className="text-xs text-gray-400">Nomor yang digunakan untuk transaksi ilegal:</div>

          <div className="font-mono mt-1">{report.phone || '-'}</div>

        </div>

        <div className="mt-3 text-xs text-gray-500">Dikirim oleh: {report.submittedBy} • {new Date(report.ts).toLocaleString()}</div>

      </div>

    </div>

  );

}

/* Upload modal */

function UploadModal({ onClose, onSubmit }) {

  const [title, setTitle] = useState('');

  const [name, setName] = useState('');

  const [phone, setPhone] = useState('');

  const [desc, setDesc] = useState('');

  const [imgBase64, setImgBase64] = useState('');

  function handleFile(e){

    const f = e.target.files[0];

    if(!f) return;

    const reader = new FileReader();

    reader.onload = function(ev){ setImgBase64(ev.target.result); };

    reader.readAsDataURL(f);

  }

  function submit(e){

    e.preventDefault();

    if(!title){ alert('Isi judul'); return; }

    onSubmit({ title, name, phone, description: desc, imgBase64 });

  }

  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

      <div className="bg-[#0f1721] max-w-md w-full rounded-lg p-4">

        <div className="flex justify-between items-center mb-3">

          <div className="font-semibold">Upload Laporan (butuh persetujuan admin)</div>

          <button onClick={onClose} className="text-gray-400">Tutup</button>

        </div>

        <form onSubmit={submit} className="space-y-3">

          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Judul modus (contoh: penipuan transfer)" className="w-full px-3 py-2 bg-[#0b1220] rounded" />

          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama pelaku / akun (boleh kosong)" className="w-full px-3 py-2 bg-[#0b1220] rounded" />

          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Nomor telepon (yang dipakai untuk transaksi ilegal)" className="w-full px-3 py-2 bg-[#0b1220] rounded" />

          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Deskripsi singkat modus" className="w-full px-3 py-2 bg-[#0b1220] rounded" />

          <div>

            <label className="text-sm text-gray-300">Bukti foto (screenshot):</label>

            <input type="file" accept="image/*" onChange={handleFile} className="w-full mt-1 text-sm" />

            {imgBase64 && <img src={imgBase64} alt="preview" className="mt-2 w-full h-36 object-cover rounded" />}

          </div>

          <div className="flex justify-end gap-2">

            <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-700">Batal</button>

            <button type="submit" className="px-3 py-1 rounded bg-red-600">Kirim (Menunggu Admin)</button>

          </div>

        </form>

      </div>

    </div>

  );

}

/* Simple inline login form used in header when not logged */

function LoginInline({ onLogin }){

  const [open, setOpen] = useState(false);

  const [u, setU] = useState(''); const [p, setP] = useState('');

  return (

    <div className="relative">

      {!open && <button onClick={()=>setOpen(true)} className="bg-indigo-600 px-3 py-1 rounded text-sm">Login</button>}

      {open && (

        <div className="absolute right-0 mt-2 w-64 bg-[#0b1220] p-3 rounded shadow">

          <div className="font-semibold mb-2">Login</div>

          <input value={u} onChange={e=>setU(e.target.value)} placeholder="username" className="w-full px-2 py-1 bg-[#071021] rounded mb-2 text-sm" />

          <input value={p} onChange={e=>setP(e.target.value)} placeholder="password" type="password" className="w-full px-2 py-1 bg-[#071021] rounded mb-2 text-sm" />

          <div className="flex justify-end gap-2">

            <button onClick={()=>setOpen(false)} className="px-2 py-1 rounded bg-gray-700 text-sm">Batal</button>

            <button onClick={()=>{ if(onLogin(u,p)) setOpen(false); }} className="px-2 py-1 rounded bg-indigo-600 text-sm">Masuk</button>

          </div>

        </div>

      )}

    </div>

  );

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);