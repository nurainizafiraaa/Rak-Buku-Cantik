import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";

const GENRES = ["Fiksi", "Non-Fiksi", "Sejarah", "Sains", "Biografi", "Anak", "Bisnis", "Puisi", "Self Improvement", "Lainnya"];

const PASTELS = ["#FFE1EC", "#FFF1D6", "#E6F4EA", "#EDE4FB", "#DFF3F5", "#FFE9DA"];
function pastelFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return PASTELS[Math.abs(h) % PASTELS.length];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

function genCode(prefix) {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${n}`;
}

const T = {
  id: {
    appName: "Rak Cantik",
    tagline: "Beauty from the inside, starting from carrying and learning together.",
    loginMember: "Masuk sebagai Member",
    loginOwner: "Masuk sebagai Owner",
    memberName: "Nama Member",
    ownerName: "Nama Owner",
    accessCode: "Kode Akses",
    login: "Masuk",
    back: "Kembali",
    logout: "Keluar",
    katalog: "Katalog",
    peminjaman: "Peminjaman",
    members: "Members",
    katalogBuku: "Katalog Buku",
    searchPlaceholder: "Cari judul atau penulis...",
    allGenre: "Semua Genre",
    allLanguage: "Semua Bahasa",
    allStatus: "Semua Status",
    startDate: "Tanggal Mulai",
    endDate: "Tanggal Selesai",
    addBook: "Tambah Buku",
    available: "Tersedia",
    reading: "Dipinjam",
    noBooks: "Belum ada buku yang cocok dengan pencarianmu.",
    ownerLabel: "Owner",
    edit: "Edit",
    delete: "Hapus",
    borrow: "Ajukan Pinjam",
    yourBook: "Buku Kamu",
    addBookTitle: "Tambah Buku Baru",
    bookCode: "Kode Buku",
    title: "Judul",
    author: "Penulis",
    genre: "Genre",
    condition: "Kondisi",
    coverUrl: "Foto Sampul (opsional)",
    uploading: "Mengunggah foto...",
    bookLanguage: "Bahasa Buku",
    notes: "Catatan",
    status: "Status",
    finishBy: "Target Selesai Dibaca",
    save: "Simpan",
    cancel: "Batal",
    loanRequest: "Ajukan Peminjaman",
    book: "Buku",
    pickBook: "Pilih buku",
    borrowerName: "Nama Peminjam",
    loanDate: "Tanggal Pinjam",
    targetReturn: "Target Kembali",
    submit: "Ajukan",
    myLoans: "Pinjaman Saya",
    incoming: "Permintaan Masuk",
    noLoans: "Belum ada peminjaman.",
    approve: "Setujui",
    reject: "Tolak",
    markReturned: "Tandai Dikembalikan",
    pending: "Menunggu Persetujuan",
    approved: "Disetujui",
    active: "Sedang Dipinjam",
    returned: "Sudah Dikembalikan",
    rejectedStatus: "Ditolak",
    addMember: "Tambah Member",
    fullName: "Nama lengkap",
    email: "Email",
    wa: "Kontak WA",
    role: "Role",
    member: "Member",
    owner: "Owner",
    secretCode: "Kode rahasia verifikasi",
    footer: "Organized by GDP Girls",
    errFillName: "Nama tidak boleh kosong.",
    errWrongCode: "Kode akses salah.",
    errEndBeforeStart: "Tanggal kembali harus setelah tanggal pinjam.",
    errConflict: "Buku sudah dipesan/dipinjam pada rentang tanggal ini.",
  },
  en: {
    appName: "Rak Cantik",
    tagline: "Beauty from the inside, starting from carrying and learning together.",
    loginMember: "Login as Member",
    loginOwner: "Login as Owner",
    memberName: "Member Name",
    ownerName: "Owner Name",
    accessCode: "Access Code",
    login: "Login",
    back: "Back",
    logout: "Log out",
    katalog: "Catalog",
    peminjaman: "Loans",
    members: "Members",
    katalogBuku: "Book Catalog",
    searchPlaceholder: "Search title or author...",
    allGenre: "All Genres",
    allLanguage: "All Languages",
    allStatus: "All Status",
    startDate: "Start Date",
    endDate: "End Date",
    addBook: "Add Book",
    available: "Available",
    reading: "Borrowed",
    noBooks: "No books match your search.",
    ownerLabel: "Owner",
    edit: "Edit",
    delete: "Delete",
    borrow: "Request to Borrow",
    yourBook: "Your Book",
    addBookTitle: "Add New Book",
    bookCode: "Book Code",
    title: "Title",
    author: "Author",
    genre: "Genre",
    condition: "Condition",
    coverUrl: "Cover Photo (optional)",
    uploading: "Uploading photo...",
    bookLanguage: "Book Language",
    notes: "Notes",
    status: "Status",
    finishBy: "Expected Finish Date",
    save: "Save",
    cancel: "Cancel",
    loanRequest: "Request a Loan",
    book: "Book",
    pickBook: "Choose a book",
    borrowerName: "Borrower Name",
    loanDate: "Loan Date",
    targetReturn: "Target Return",
    submit: "Submit",
    myLoans: "My Loans",
    incoming: "Incoming Requests",
    noLoans: "No loans yet.",
    approve: "Approve",
    reject: "Reject",
    markReturned: "Mark as Returned",
    pending: "Pending Approval",
    approved: "Approved",
    active: "Currently Borrowed",
    returned: "Returned",
    rejectedStatus: "Rejected",
    addMember: "Add Member",
    fullName: "Full name",
    email: "Email",
    wa: "WA Contact",
    role: "Role",
    member: "Member",
    owner: "Owner",
    secretCode: "Secret code for verification",
    footer: "Organized by GDP Girls",
    errFillName: "Name cannot be empty.",
    errWrongCode: "Wrong access code.",
    errEndBeforeStart: "Return date must be after loan date.",
    errConflict: "This book is already booked/borrowed for this date range.",
  },
};

function Btn({ children, onClick, variant = "primary", disabled, style, type = "button" }) {
  const variants = {
    primary: { background: "#C6789A", color: "#fff", border: "1px solid #C6789A" },
    ghost: { background: "#fff", color: "#7A5C6E", border: "1px solid #E7D3DE" },
    danger: { background: "#fff", color: "#B4544F", border: "1px solid #EFC9C4" },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...variants[variant],
        padding: "9px 16px",
        borderRadius: 8,
        fontSize: 13.5,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid #E7D3DE",
  borderRadius: 7,
  fontSize: 14,
  background: "#fffdfb",
  color: "#4A3B45",
  boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#8A6D7D", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #F0DCE6", borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  );
}

const STATUS_COLORS = {
  pending: { bg: "#FFF1D6", color: "#8A6A1F" },
  approved: { bg: "#E6F4EA", color: "#2F6B3F" },
  active: { bg: "#FBE0D6", color: "#A6542D" },
  returned: { bg: "#E4EEF0", color: "#3C5A5E" },
  rejected: { bg: "#FBDCD9", color: "#A6402D" },
};

export default function App() {
  const [lang, setLang] = useState("id");
  const t = T[lang];

  const [session, setSession] = useState(null); // {id, name, role}
  const [screen, setScreen] = useState("welcome"); // welcome | login-member | login-owner
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);

  const [tab, setTab] = useState("katalog");
  const [err, setErr] = useState("");

  // login form state
  const [inputName, setInputName] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const fetchAll = useCallback(async () => {
    const [m, b, l] = await Promise.all([
      supabase.from("members").select("*").order("created_at", { ascending: false }),
      supabase.from("books").select("*").order("created_at", { ascending: false }),
      supabase.from("loans").select("*").order("created_at", { ascending: false }),
    ]);
    if (m.data) setMembers(m.data);
    if (b.data) setBooks(b.data);
    if (l.data) setLoans(l.data);
    if (m.error || b.error || l.error) setErr("Gagal memuat data. Coba refresh halaman.");
  }, []);

  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem("rakcantik_session");
      if (saved) {
        try {
          setSession(JSON.parse(saved));
        } catch (e) {}
      }
      await fetchAll();
      setLoading(false);
    })();
  }, [fetchAll]);

  const doLoginMember = async () => {
    setLoginErr("");
    if (!inputName.trim()) return setLoginErr(t.errFillName);
    let member = members.find((m) => m.name.toLowerCase() === inputName.trim().toLowerCase() && m.role === "member");
    if (!member) {
      const { data, error } = await supabase
        .from("members")
        .insert({ name: inputName.trim(), role: "member" })
        .select()
        .single();
      if (error) return setLoginErr("Gagal membuat akun member. Coba lagi.");
      member = data;
      setMembers((prev) => [data, ...prev]);
    }
    const s = { id: member.id, name: member.name, role: "member" };
    setSession(s);
    localStorage.setItem("rakcantik_session", JSON.stringify(s));
    setScreen("app");
    setTab("katalog");
  };

  const doLoginOwner = async () => {
    setLoginErr("");
    if (!inputName.trim()) return setLoginErr(t.errFillName);
    const owner = members.find(
      (m) => m.name.toLowerCase() === inputName.trim().toLowerCase() && (m.role === "owner" || m.role === "queen") && m.access_code === inputCode
    );
    if (!owner) return setLoginErr(t.errWrongCode);
    const s = { id: owner.id, name: owner.name, role: owner.role };
    setSession(s);
    localStorage.setItem("rakcantik_session", JSON.stringify(s));
    setScreen("app");
    setTab("katalog");
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("rakcantik_session");
    setScreen("welcome");
    setInputName("");
    setInputCode("");
  };

  // ---- Books ----
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const blankBook = { title: "", author: "", genre: GENRES[0], condition: "Baik", cover_url: "", notes: "", availability_status: "available", reading_until: "", language: "Indonesia" };
  const [bookForm, setBookForm] = useState(blankBook);

  const [uploadingCover, setUploadingCover] = useState(false);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setErr("");
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("book-covers").upload(fileName, file);
    if (uploadError) {
      setErr("Gagal upload foto: " + uploadError.message);
      setUploadingCover(false);
      return;
    }
    const { data } = supabase.storage.from("book-covers").getPublicUrl(fileName);
    setBookForm((prev) => ({ ...prev, cover_url: data.publicUrl }));
    setUploadingCover(false);
  };

  const openAddBook = () => {
    setBookForm(blankBook);
    setEditingBook(null);
    setShowAddBook(true);
  };
  const openEditBook = (b) => {
    setBookForm({
      title: b.title, author: b.author, genre: b.genre || GENRES[0], condition: b.condition || "Baik",
      cover_url: b.cover_url || "", notes: b.notes || "", availability_status: b.availability_status, reading_until: b.reading_until || "",
      language: b.language || "Indonesia",
    });
    setEditingBook(b);
    setShowAddBook(true);
  };

  const saveBook = async () => {
    setErr("");
    if (!bookForm.title.trim() || !bookForm.author.trim()) return;
    const cleanForm = { ...bookForm, reading_until: bookForm.reading_until ? bookForm.reading_until : null };
    if (editingBook) {
      const { data, error } = await supabase.from("books").update(cleanForm).eq("id", editingBook.id).select().single();
      if (error) return setErr("Gagal menyimpan buku: " + error.message);
      if (data) setBooks((prev) => prev.map((b) => (b.id === data.id ? data : b)));
    } else {
      const payload = { ...cleanForm, book_code: genCode("BK-"), owner_id: session.id };
      const { data, error } = await supabase.from("books").insert(payload).select().single();
      if (error) return setErr("Gagal menyimpan buku: " + error.message);
      if (data) setBooks((prev) => [data, ...prev]);
    }
    setShowAddBook(false);
    setEditingBook(null);
  };

  const deleteBook = async (id) => {
    await supabase.from("loans").delete().eq("book_id", id);
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) return setErr("Gagal menghapus buku: " + error.message);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setLoans((prev) => prev.filter((l) => l.book_id !== id));
  };

  // ---- Loans ----
  const activeRangesFor = (bookId, excludeLoanId) =>
    loans.filter((l) => l.book_id === bookId && l.id !== excludeLoanId && ["pending", "approved", "active"].includes(l.status));

  function deriveBookStatus(book) {
    const today = todayISO();
    if (book.availability_status === "reading" && book.reading_until && book.reading_until >= today) return "reading";
    const activeLoan = loans.find(
      (l) => l.book_id === book.id && l.status === "active" && l.loan_date <= today && today <= l.target_return_date
    );
    return activeLoan ? "reading" : "available";
  }

  const [requestModalBook, setRequestModalBook] = useState(null);
  const [reqStart, setReqStart] = useState(todayISO());
  const [reqEnd, setReqEnd] = useState(todayISO());
  const [reqNote, setReqNote] = useState("");
  const [reqErr, setReqErr] = useState("");

  const submitLoan = async () => {
    setReqErr("");
    if (reqEnd < reqStart) return setReqErr(t.errEndBeforeStart);
    const conflict = activeRangesFor(requestModalBook.id).some((l) => overlaps(reqStart, reqEnd, l.loan_date, l.target_return_date));
    if (conflict) return setReqErr(t.errConflict);
    const payload = {
      loan_code: genCode("PJ-"),
      book_id: requestModalBook.id,
      borrower_id: session.id,
      loan_date: reqStart,
      target_return_date: reqEnd,
      status: "pending",
      notes: reqNote,
    };
    const { data, error } = await supabase.from("loans").insert(payload).select().single();
    if (!error && data) setLoans((prev) => [data, ...prev]);
    setRequestModalBook(null);
    setReqNote("");
    setTab("peminjaman");
  };

  const respondLoan = async (loan, action) => {
    let update = {};
    if (action === "approve") update = { status: "approved" };
    if (action === "reject") update = { status: "rejected" };
    if (action === "activate") update = { status: "active" };
    if (action === "return") update = { status: "returned", actual_return_date: todayISO() };
    const { data, error } = await supabase.from("loans").update(update).eq("id", loan.id).select().single();
    if (!error && data) setLoans((prev) => prev.map((l) => (l.id === data.id ? data : l)));
  };

  // ---- Members ----
  const [showAddMember, setShowAddMember] = useState(false);
  const blankMember = { name: "", email: "", wa_contact: "", role: "member", access_code: "" };
  const [memberForm, setMemberForm] = useState(blankMember);

  const [newOwnerCode, setNewOwnerCode] = useState(null);

  const deleteMember = async (id) => {
    // clean up related loans & books first to avoid foreign key errors
    const theirBooks = books.filter((b) => b.owner_id === id).map((b) => b.id);
    if (theirBooks.length) await supabase.from("loans").delete().in("book_id", theirBooks);
    await supabase.from("loans").delete().eq("borrower_id", id);
    await supabase.from("books").delete().eq("owner_id", id);
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) return setErr("Gagal menghapus member: " + error.message);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setBooks((prev) => prev.filter((b) => b.owner_id !== id));
    setLoans((prev) => prev.filter((l) => l.borrower_id !== id && !theirBooks.includes(l.book_id)));
  };

  const saveMember = async () => {
    if (!memberForm.name.trim()) return;
    const payload = { ...memberForm };
    if (payload.role !== "owner") {
      payload.access_code = null;
    } else if (!payload.access_code.trim()) {
      payload.access_code = genCode("WG-");
    }
    const { data, error } = await supabase.from("members").insert(payload).select().single();
    if (error) return setErr("Gagal menambah member: " + error.message);
    if (data) {
      setMembers((prev) => [data, ...prev]);
      if (data.role === "owner") setNewOwnerCode({ name: data.name, code: data.access_code });
    }
    setShowAddMember(false);
    setMemberForm(blankMember);
  };

  // ---- Filters ----
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("Semua");
  const [langFilter, setLangFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const memberName = (id) => members.find((m) => m.id === id)?.name || "-";

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (genreFilter !== "Semua" && b.genre !== genreFilter) return false;
      if (langFilter !== "Semua" && b.language !== langFilter) return false;
      const derived = deriveBookStatus(b);
      if (statusFilter !== "Semua" && derived !== statusFilter) return false;
      const q = search.trim().toLowerCase();
      if (q && !(b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))) return false;
      if (dateStart && dateEnd) {
        const conflict = activeRangesFor(b.id).some((l) => overlaps(dateStart, dateEnd, l.loan_date, l.target_return_date));
        if (conflict) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, search, genreFilter, langFilter, statusFilter, dateStart, dateEnd, loans]);

  const myBooks = useMemo(() => (session ? books.filter((b) => b.owner_id === session.id) : []), [books, session]);
  const incomingLoans = useMemo(
    () => (session ? loans.filter((l) => books.find((b) => b.id === l.book_id)?.owner_id === session.id) : []),
    [loans, books, session]
  );
  const myLoans = useMemo(() => (session ? loans.filter((l) => l.borrower_id === session.id) : []), [loans, session]);

  const availableBooksForLoan = useMemo(() => books.filter((b) => deriveBookStatus(b) === "available" && b.owner_id !== session?.id), [books, loans, session]);

  const isOwnerOf = (book) => session && book.owner_id === session.id;
  const isQueen = session && session.role === "queen";
  const canManage = session && (session.role === "owner" || session.role === "queen");

  const LangToggle = () => (
    <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 20, padding: 3, border: "1px solid #F0DCE6" }}>
      {["id", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            border: "none",
            borderRadius: 16,
            padding: "4px 10px",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
            background: lang === l ? "#C6789A" : "transparent",
            color: lang === l ? "#fff" : "#8A6D7D",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", fontFamily: "Inter, sans-serif", color: "#8A6D7D" }}>Loading...</div>;
  }

  if (!session || screen !== "app") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          <LangToggle />
        </div>
        <div
          style={{
            width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#F6C6DC,#E8B9E6)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 28,
          }}
        >
          🌸
        </div>
        <h1 style={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 30, color: "#6B3B54", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          {t.appName}
        </h1>
        <p style={{ color: "#8A6D7D", fontSize: 14, textAlign: "center", maxWidth: 340, marginTop: 8 }}>{t.tagline} ✨</p>

        <Card style={{ width: 360, maxWidth: "100%", marginTop: 24 }}>
          {screen === "welcome" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn onClick={() => setScreen("login-member")} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                🌸 {t.loginMember}
              </Btn>
              <Btn variant="ghost" onClick={() => setScreen("login-owner")} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                ✨ {t.loginOwner}
              </Btn>
            </div>
          )}
          {screen === "login-member" && (
            <div>
              <Field label={t.memberName}>
                <input style={inputStyle} value={inputName} onChange={(e) => setInputName(e.target.value)} autoFocus />
              </Field>
              {loginErr && <div style={{ color: "#B4544F", fontSize: 12.5, marginBottom: 10 }}>{loginErr}</div>}
              <Btn onClick={doLoginMember} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>{t.login}</Btn>
              <Btn variant="ghost" onClick={() => { setScreen("welcome"); setLoginErr(""); setInputName(""); }} style={{ width: "100%", justifyContent: "center" }}>{t.back}</Btn>
            </div>
          )}
          {screen === "login-owner" && (
            <div>
              <Field label={t.ownerName}>
                <input style={inputStyle} value={inputName} onChange={(e) => setInputName(e.target.value)} autoFocus />
              </Field>
              <Field label={t.accessCode}>
                <input type="password" style={inputStyle} value={inputCode} onChange={(e) => setInputCode(e.target.value)} />
              </Field>
              {loginErr && <div style={{ color: "#B4544F", fontSize: 12.5, marginBottom: 10 }}>{loginErr}</div>}
              <Btn onClick={doLoginOwner} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>{t.login}</Btn>
              <Btn variant="ghost" onClick={() => { setScreen("welcome"); setLoginErr(""); setInputName(""); setInputCode(""); }} style={{ width: "100%", justifyContent: "center" }}>{t.back}</Btn>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const tabs =
    canManage
      ? [
          { id: "katalog", label: t.katalog },
          { id: "peminjaman", label: t.peminjaman },
          { id: "members", label: t.members },
        ]
      : [
          { id: "katalog", label: t.katalog },
          { id: "peminjaman", label: t.peminjaman },
        ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#4A3B45", paddingBottom: 60 }}>
      <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#F6C6DC,#E8B9E6)", display: "flex", alignItems: "center", justifyContent: "center" }}>🌸</div>
          <span style={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 18, color: "#6B3B54" }}>{t.appName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LangToggle />
          <span style={{ fontSize: 12, background: isQueen ? "#F0C419" : session.role === "owner" ? "#F6C6DC" : "#DFF3F5", color: "#6B3B54", padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>
            {isQueen ? "👑 Queen" : session.role === "owner" ? t.owner : t.member}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{session.name}</span>
          <Btn variant="ghost" onClick={logout}>{t.logout}</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "0 24px", borderBottom: "1px solid #F0DCE6" }}>
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{
              padding: "10px 14px", fontSize: 13.5, fontWeight: 700, background: "transparent", border: "none",
              borderBottom: tab === tb.id ? "2.5px solid #C6789A" : "2.5px solid transparent",
              color: tab === tb.id ? "#6B3B54" : "#B79AA8", cursor: "pointer",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        {err && <div style={{ background: "#FBDCD9", color: "#A6402D", padding: "8px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 14 }}>{err}</div>}

        {tab === "katalog" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontFamily: "'Bitter', serif", fontSize: 21, color: "#6B3B54", margin: 0 }}>🌷 {t.katalogBuku}</h2>
              {canManage && <Btn onClick={openAddBook}>+ {t.addBook}</Btn>}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              <input style={{ ...inputStyle, flex: "1 1 200px" }} placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
              <select style={{ ...inputStyle, width: 150 }} value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                <option value="Semua">{t.allGenre}</option>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
              <select style={{ ...inputStyle, width: 140 }} value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
                <option value="Semua">{t.allLanguage}</option>
                <option value="Indonesia">Indonesia</option>
                <option value="English">English</option>
                <option value="Arab">Arab</option>
              </select>
              <select style={{ ...inputStyle, width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Semua">{t.allStatus}</option>
                <option value="available">{t.available}</option>
                <option value="reading">{t.reading}</option>
              </select>
              <input type="date" style={{ ...inputStyle, width: 150 }} value={dateStart} onChange={(e) => setDateStart(e.target.value)} title={t.startDate} />
              <input type="date" style={{ ...inputStyle, width: 150 }} value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} title={t.endDate} />
            </div>

            {filteredBooks.length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, color: "#B79AA8" }}>{t.noBooks}</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 }}>
                {filteredBooks.map((b) => {
                  const status = deriveBookStatus(b);
                  return (
                    <div key={b.id} style={{ background: pastelFor(b.id), borderRadius: 12, padding: 16, position: "relative" }}>
                      <span style={{
                        position: "absolute", top: 12, right: 12, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        background: status === "available" ? "#E6F4EA" : "#FBE0D6", color: status === "available" ? "#2F6B3F" : "#A6542D",
                      }}>
                        {status === "available" ? t.available : t.reading}
                      </span>
                      <div style={{ fontFamily: "'Bitter', serif", fontWeight: 700, fontSize: 15.5, paddingRight: 70, marginBottom: 2, color: "#5A3B4A" }}>{b.title}</div>
                      <div style={{ fontSize: 12.5, color: "#8A6D7D", marginBottom: 8 }}>{b.author}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                        <span style={{ fontSize: 10.5, background: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 20 }}>{b.genre}</span>
                        <span style={{ fontSize: 10.5, background: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 20 }}>{b.condition}</span>
                        {b.language && <span style={{ fontSize: 10.5, background: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 20 }}>{b.language}</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#8A6D7D", marginBottom: 12 }}>{t.ownerLabel}: {memberName(b.owner_id)}</div>
                      {isOwnerOf(b) ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn variant="ghost" onClick={() => openEditBook(b)} style={{ flex: 1, justifyContent: "center" }}>{t.edit}</Btn>
                          <Btn variant="danger" onClick={() => deleteBook(b.id)} style={{ flex: 1, justifyContent: "center" }}>{t.delete}</Btn>
                        </div>
                      ) : isQueen ? (
                        <Btn variant="danger" onClick={() => deleteBook(b.id)} style={{ width: "100%", justifyContent: "center" }}>
                          👑 {t.delete}
                        </Btn>
                      ) : (
                        <Btn onClick={() => { setRequestModalBook(b); setReqStart(todayISO()); setReqEnd(todayISO()); setReqErr(""); }} disabled={status !== "available"} style={{ width: "100%", justifyContent: "center" }}>
                          {t.borrow}
                        </Btn>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "peminjaman" && (
          <div>
            {session.role === "owner" && (
              <div style={{ marginBottom: 30 }}>
                <h2 style={{ fontFamily: "'Bitter', serif", fontSize: 19, color: "#6B3B54" }}>{t.incoming}</h2>
                {incomingLoans.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: "#B79AA8" }}>{t.noLoans}</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {incomingLoans.map((l) => {
                      const book = books.find((b) => b.id === l.book_id);
                      const sc = STATUS_COLORS[l.status];
                      return (
                        <Card key={l.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{book?.title}</div>
                              <div style={{ fontSize: 12.5, color: "#8A6D7D" }}>{t.borrowerName}: <b>{memberName(l.borrower_id)}</b></div>
                              <div style={{ fontSize: 12, color: "#B79AA8", marginTop: 4 }}>{l.loan_date} — {l.target_return_date}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: sc.bg, color: sc.color }}>{t[l.status] || l.status}</span>
                              <div style={{ display: "flex", gap: 6 }}>
                                {l.status === "pending" && (<>
                                  <Btn onClick={() => respondLoan(l, "approve")}>{t.approve}</Btn>
                                  <Btn variant="danger" onClick={() => respondLoan(l, "reject")}>{t.reject}</Btn>
                                </>)}
                                {l.status === "approved" && <Btn onClick={() => respondLoan(l, "activate")}>{t.active}</Btn>}
                                {l.status === "active" && <Btn variant="ghost" onClick={() => respondLoan(l, "return")}>{t.markReturned}</Btn>}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <h2 style={{ fontFamily: "'Bitter', serif", fontSize: 19, color: "#6B3B54" }}>{t.myLoans}</h2>
            {myLoans.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#B79AA8" }}>{t.noLoans}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myLoans.map((l) => {
                  const book = books.find((b) => b.id === l.book_id);
                  const sc = STATUS_COLORS[l.status];
                  return (
                    <Card key={l.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{book?.title}</div>
                          <div style={{ fontSize: 12.5, color: "#8A6D7D" }}>{t.ownerLabel}: {memberName(book?.owner_id)}</div>
                          <div style={{ fontSize: 12, color: "#B79AA8", marginTop: 4 }}>{l.loan_date} — {l.target_return_date}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: sc.bg, color: sc.color, alignSelf: "flex-start" }}>{t[l.status] || l.status}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "members" && canManage && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Bitter', serif", fontSize: 21, color: "#6B3B54", margin: 0 }}>👥 {t.members}</h2>
              <Btn onClick={() => setShowAddMember(true)}>+ {t.addMember}</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {members.map((m) => (
                <Card key={m.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: "#8A6D7D" }}>{m.email || "-"} {m.wa_contact ? `· WA: ${m.wa_contact}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: m.role === "queen" ? "#F0C419" : m.role === "owner" ? "#F6C6DC" : "#DFF3F5", color: "#6B3B54" }}>
                        {m.role === "queen" ? "👑 Queen" : m.role === "owner" ? t.owner : t.member}
                      </span>
                      {(m.role === "owner" || m.role === "queen") && canManage && (
                        <Btn variant="ghost" onClick={() => setNewOwnerCode({ name: m.name, code: m.access_code })}>
                          {lang === "id" ? "Lihat Kode" : "View Code"}
                        </Btn>
                      )}
                      {isQueen && m.role !== "queen" && (
                        <Btn variant="danger" onClick={() => deleteMember(m.id)}>
                          🗑
                        </Btn>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "20px", color: "#B79AA8", fontSize: 12 }}>🌸 {t.footer} 🌸</div>

      {/* Add/Edit Book Modal */}
      {showAddBook && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(107,59,84,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={() => setShowAddBook(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: "100%" }}>
            <Card>
              <div style={{ fontFamily: "'Bitter', serif", fontWeight: 700, fontSize: 17, marginBottom: 14, color: "#6B3B54" }}>{t.addBookTitle}</div>
              <Field label={t.title}><input style={inputStyle} value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} /></Field>
              <Field label={t.author}><input style={inputStyle} value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} /></Field>
              <Field label={t.genre}>
                <select style={inputStyle} value={bookForm.genre} onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}>
                  {GENRES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label={t.condition}>
                <select style={inputStyle} value={bookForm.condition} onChange={(e) => setBookForm({ ...bookForm, condition: e.target.value })}>
                  <option>Baru</option><option>Baik</option><option>Cukup Baik</option><option>Lecek</option>
                </select>
              </Field>
              <Field label={t.coverUrl}>
                {bookForm.cover_url && (
                  <img src={bookForm.cover_url} alt="cover" style={{ width: 70, height: 92, objectFit: "cover", borderRadius: 6, marginBottom: 8, border: "1px solid #E7D3DE" }} />
                )}
                <input type="file" accept="image/*" onChange={handleCoverUpload} style={inputStyle} disabled={uploadingCover} />
                {uploadingCover && <div style={{ fontSize: 12, color: "#8A6D7D", marginTop: 4 }}>{t.uploading}</div>}
              </Field>
              <Field label={t.bookLanguage}>
                <select style={inputStyle} value={bookForm.language} onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}>
                  <option value="Indonesia">Indonesia</option>
                  <option value="English">English</option>
                  <option value="Arab">Arab</option>
                </select>
              </Field>
              <Field label={t.status}>
                <select style={inputStyle} value={bookForm.availability_status} onChange={(e) => setBookForm({ ...bookForm, availability_status: e.target.value })}>
                  <option value="available">{t.available}</option>
                  <option value="reading">{t.reading} (owner)</option>
                </select>
              </Field>
              {bookForm.availability_status === "reading" && (
                <Field label={t.finishBy}><input type="date" style={inputStyle} value={bookForm.reading_until} onChange={(e) => setBookForm({ ...bookForm, reading_until: e.target.value })} /></Field>
              )}
              <Field label={t.notes}><input style={inputStyle} value={bookForm.notes} onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })} /></Field>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <Btn onClick={saveBook}>{t.save}</Btn>
                <Btn variant="ghost" onClick={() => setShowAddBook(false)}>{t.cancel}</Btn>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Loan request modal */}
      {requestModalBook && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(107,59,84,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={() => setRequestModalBook(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: "100%" }}>
            <Card>
              <div style={{ fontFamily: "'Bitter', serif", fontWeight: 700, fontSize: 16, marginBottom: 4, color: "#6B3B54" }}>{t.loanRequest}</div>
              <div style={{ fontSize: 13, color: "#8A6D7D", marginBottom: 14 }}>{requestModalBook.title}</div>
              <Field label={t.borrowerName}><input style={{ ...inputStyle, background: "#f3ecef" }} value={session.name} disabled /></Field>
              <Field label={t.loanDate}><input type="date" style={inputStyle} value={reqStart} min={todayISO()} onChange={(e) => setReqStart(e.target.value)} /></Field>
              <Field label={t.targetReturn}><input type="date" style={inputStyle} value={reqEnd} min={reqStart} onChange={(e) => setReqEnd(e.target.value)} /></Field>
              <Field label={t.notes}><input style={inputStyle} value={reqNote} onChange={(e) => setReqNote(e.target.value)} /></Field>
              {reqErr && <div style={{ color: "#B4544F", fontSize: 12.5, marginBottom: 10 }}>{reqErr}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <Btn onClick={submitLoan}>{t.submit}</Btn>
                <Btn variant="ghost" onClick={() => setRequestModalBook(null)}>{t.cancel}</Btn>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {showAddMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(107,59,84,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={() => setShowAddMember(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: "100%" }}>
            <Card>
              <div style={{ fontFamily: "'Bitter', serif", fontWeight: 700, fontSize: 16, marginBottom: 14, color: "#6B3B54" }}>{t.addMember}</div>
              <Field label={t.fullName}><input style={inputStyle} value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} /></Field>
              <Field label={t.email}><input style={inputStyle} value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} /></Field>
              <Field label={t.wa}><input style={inputStyle} value={memberForm.wa_contact} onChange={(e) => setMemberForm({ ...memberForm, wa_contact: e.target.value })} /></Field>
              <Field label={t.role}>
                <select style={inputStyle} value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
                  <option value="member">{t.member}</option>
                  <option value="owner">{t.owner}</option>
                </select>
              </Field>
              {memberForm.role === "owner" && (
                <Field label={lang === "id" ? "Kode Akses (buat sendiri)" : "Access Code (create your own)"}>
                  <input
                    style={inputStyle}
                    value={memberForm.access_code}
                    onChange={(e) => setMemberForm({ ...memberForm, access_code: e.target.value })}
                    placeholder={lang === "id" ? "Contoh: bungaJap25" : "e.g. bungaJap25"}
                  />
                  <div style={{ fontSize: 11.5, color: "#8A6D7D", marginTop: 5 }}>
                    {lang === "id"
                      ? "Kosongkan kalau mau dibuatkan otomatis."
                      : "Leave blank to auto-generate one."}
                  </div>
                </Field>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <Btn onClick={saveMember}>{t.save}</Btn>
                <Btn variant="ghost" onClick={() => setShowAddMember(false)}>{t.cancel}</Btn>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* New owner code reveal modal */}
      {newOwnerCode && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(107,59,84,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }} onClick={() => setNewOwnerCode(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 360, maxWidth: "100%" }}>
            <Card>
              <div style={{ fontFamily: "'Bitter', serif", fontWeight: 700, fontSize: 16, marginBottom: 10, color: "#6B3B54" }}>
                🌸 {lang === "id" ? "Owner baru ditambahkan!" : "New owner added!"}
              </div>
              <p style={{ fontSize: 13.5, color: "#8A6D7D", marginBottom: 10 }}>
                {lang === "id"
                  ? `Kode akses untuk ${newOwnerCode.name} adalah:`
                  : `Access code for ${newOwnerCode.name} is:`}
              </p>
              <div style={{ background: "#FFF1D6", borderRadius: 8, padding: "12px 16px", textAlign: "center", fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#6B3B54", marginBottom: 14, letterSpacing: 1 }}>
                {newOwnerCode.code}
              </div>
              <p style={{ fontSize: 12, color: "#B79AA8", marginBottom: 14 }}>
                {lang === "id" ? "Catat/kirim kode ini sekarang — tidak akan ditampilkan lagi." : "Save/send this code now — it won't be shown again."}
              </p>
              <Btn onClick={() => setNewOwnerCode(null)} style={{ width: "100%", justifyContent: "center" }}>OK</Btn>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
