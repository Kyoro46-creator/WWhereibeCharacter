const $=id=>document.getElementById(id);
const cfg=window.APP_CONFIG||{};
if((cfg.SUPABASE_URL||"").includes("PASTE_")||(cfg.SUPABASE_ANON_KEY||"").includes("PASTE_")){
  $("status").textContent="Isi js/config.js dengan Supabase Project URL dan anon key.";
  $("status").classList.remove("hidden"); $("status").classList.add("error");
}else{
const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
let chars=[],user=null,selected=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function authUI() {
  const loginOpen = $("loginOpen");
  const logout = $("logout");
  const addOpen = $("addOpen");
  const editBtn = $("editBtn");

  if (loginOpen) loginOpen.classList.toggle("hidden", !!user);
  if (logout) logout.classList.toggle("hidden", !user);
  if (addOpen) addOpen.classList.toggle("hidden", !user);
  if (editBtn) editBtn.classList.toggle("hidden", !user);
}
async function load(){ const {data,error}=await sb.from("characters").select("*").order("created_at",{ascending:false}); if(error){$("status").textContent=error.message;$("status").classList.remove("hidden");return;} chars=data||[]; groups(); render(); }
function groups(){const gs=[...new Set(chars.map(x=>x.group_name).filter(Boolean))].sort();$("groupFilter").innerHTML='<option value="">Semua Kelompok</option>'+gs.map(g=>`<option>${esc(g)}</option>`).join("")}
function render(){const q=$("search").value.toLowerCase(),g=$("groupFilter").value;const rows=chars.filter(c=>[c.name,c.role,c.power,c.weapon,c.group_name,c.city,c.description].join(" ").toLowerCase().includes(q)&&(!g||c.group_name===g));$("grid").innerHTML=rows.map(c=>`<article class="card" data-id="${c.id}">${c.image_url?`<img src="${esc(c.image_url)}">`:`<div class="noimg">Tanpa Foto</div>`}<div class="body"><h3>${esc(c.name)}</h3><div class="muted">${esc(c.role||"")}</div><div class="tags">${c.power?`<span class="tag">${esc(c.power)}</span>`:""}${c.weapon?`<span class="tag">${esc(c.weapon)}</span>`:""}${c.group_name?`<span class="tag">${esc(c.group_name)}</span>`:""}</div></div></article>`).join("");$("empty").classList.toggle("hidden",rows.length>0);document.querySelectorAll(".card").forEach(x=>x.onclick=()=>detail(x.dataset.id))}
function detail(id){const c=chars.find(x=>x.id===id);if(!c)return;selected=c;$("detailName").textContent=c.name;$("detailDesc").textContent=c.description||"Belum ada deskripsi.";$("detailImage").classList.toggle("hidden",!c.image_url);if(c.image_url)$("detailImage").src=c.image_url;const f=[["Peran",c.role],["Umur",c.age],["Tinggi",c.height],["Rambut",c.hair],["Mata",c.eyes],["Kekuatan",c.power],["Senjata",c.weapon],["Kelompok",c.group_name],["Kota",c.city]].filter(x=>x[1]);$("detailMeta").innerHTML=f.map(x=>`<div><b>${esc(x[0])}</b>${esc(x[1])}</div>`).join("");$("detailDialog").showModal()}
function reset(){ $("charForm").reset(); $("id").value=""; $("oldImage").value=""; $("preview").classList.add("hidden"); $("deleteBtn").classList.add("hidden"); $("formTitle").textContent="Tambah Karakter"; }
function edit(c){reset();["name","role","age","height","hair","eyes","power","weapon","group_name","city","description","story","first_chapter"].forEach(k=>$(k).value=c[k]||"");
async function upload(file){if(!file)return null;const ext=file.name.split(".").pop();const path=Date.now()+"-"+crypto.randomUUID()+"."+ext;const {error}=await sb.storage.from("character-images").upload(path,file);if(error)throw error;return sb.storage.from("character-images").getPublicUrl(path).data.publicUrl}
$("charForm").onsubmit=async e=>{e.preventDefault();try{let image=$("oldImage").value||null;if($("image").files[0])image=await upload($("image").files[0]);const p={name:$("name").value.trim(),role:$("role").value.trim()||null,age:$("age").value.trim()||null,height:$("height").value.trim()||null,hair:$("hair").value.trim()||null, eyes:$("eyes").value.trim()||null,power:$("power").value.trim()||null,weapon:$("weapon").value.trim()||null,group_name:$("group_name").value.trim()||null,city:$("city").value.trim()||null,story:$("story").value,first_chapter:parseInt($("first_chapter").value)||1,description:$("description").value.trim()||null,image_url:image};;const id=$("id").value;const r=id?await sb.from("characters").update(p).eq("id",id):await sb.from("characters").insert(p);if(r.error)throw r.error;$("charDialog").close();await load()}catch(err){alert(err.message)}}
$("deleteBtn").onclick=async()=>{if(!confirm("Hapus karakter ini?"))return;const r=await sb.from("characters").delete().eq("id",$("id").value);if(r.error)return alert(r.error.message);$("charDialog").close();load()}
$("image").onchange=e=>{const f=e.target.files[0];if(f){$("preview").src=URL.createObjectURL(f);$("preview").classList.remove("hidden")}}
const loginOpenBtn = document.getElementById("loginOpen");
const loginDialog = document.getElementById("loginDialog");

if (loginOpenBtn && loginDialog) {
  loginOpenBtn.addEventListener("click", () => {
    loginDialog.showModal();
  });
}$("addOpen").onclick=()=>{reset();$("charDialog").showModal()};$("logout").onclick=()=>sb.auth.signOut();$("editBtn").onclick=()=>selected&&edit(selected);$("search").oninput=render;$("groupFilter").onchange=render;
$("loginForm").onsubmit=async e=>{e.preventDefault();const {error}=await sb.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error)return alert(error.message);$("loginDialog").close()}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).close());
sb.auth.onAuthStateChange((_e,s)=>{user=s?.user||null;authUI()});
(async()=>{user=(await sb.auth.getSession()).data.session?.user||null;authUI();load()})();
}
let currentLang = localStorage.getItem("siteLang") || "id";

const translations = {
  id: {
    title: "WORLD WHERE I BE UNIVERS",
    subtitle: "Database karakter Cerita Original Nan46 .",
    login: "CREATOR LOGIN",
    logout: "Logout",
    add: "+ Tambah Karakter",
    search: "Cari karakter...",
    allGroups: "Semua Kelompok",
    empty: "Belum ada karakter.",
    edit: "Edit Karakter"
  },
  en: {
    title: "WORLD WHERE I BE UNIVERS",
    subtitle: "A story character database Original Story Nan46.",
    login: "CREATOR LOGIN",
    logout: "Logout",
    add: "+ Add Character",
    search: "Search characters...",
    allGroups: "All Groups",
    empty: "No characters yet.",
    edit: "Edit Character"
  }
};
function applyLanguage() {
  const t = translations[currentLang];
  if (!t) return;

  const heroTitle = document.querySelector(".hero h1");
  const heroSubtitle = document.querySelector(".hero p");

  if (heroTitle) heroTitle.textContent = t.title;
  if (heroSubtitle) heroSubtitle.textContent = t.subtitle;

  const loginOpen = document.getElementById("loginOpen");
  const logout = document.getElementById("logout");
  const addOpen = document.getElementById("addOpen");
  const search = document.getElementById("search");
  const empty = document.getElementById("empty");
  const groupFilter = document.getElementById("groupFilter");
  const langToggle = document.getElementById("langToggle");

  if (loginOpen) loginOpen.textContent = t.login;
  if (logout) logout.textContent = t.logout;
  if (addOpen) addOpen.textContent = t.add;

  if (search) search.placeholder = t.search;
  if (empty) empty.textContent = t.empty;

  if (groupFilter) {
    const firstOption = groupFilter.querySelector("option");
    if (firstOption) firstOption.textContent = t.allGroups;
  }

  if (langToggle) {
    langToggle.textContent = currentLang === "id" ? "EN" : "ID";
  }

  const labelMap = {
    name: t.name,
    role: t.role,
    age: t.age,
    height: t.height,
    hair: t.hair,
    eyes: t.eyes,
    power: t.power,
    weapon: t.weapon,
    group_name: t.group,
    city: t.city,
    description: t.description
  };

  Object.entries(labelMap).forEach(([id, text]) => {
    const input = document.getElementById(id);

    if (input) {
      const label = input.closest("label");

      if (label) {
        const textNode = [...label.childNodes].find(
          node => node.nodeType === Node.TEXT_NODE
        );

        if (textNode && text) {
          textNode.textContent = text + " ";
        }
      }
    }
  });

  const saveBtn = document.getElementById("save");
  const cancelBtn = document.getElementById("cancel");
  const deleteBtn = document.getElementById("delete");

  if (saveBtn && t.save) saveBtn.textContent = t.save;
  if (cancelBtn && t.cancel) cancelBtn.textContent = t.cancel;
  if (deleteBtn && t.delete) deleteBtn.textContent = t.delete;
}


const langToggle = document.getElementById("langToggle");

if (langToggle) {
  langToggle.onclick = () => {
    currentLang = currentLang === "id" ? "en" : "id";
    localStorage.setItem("siteLang", currentLang);
    applyLanguage();
  };
}

applyLanguage();

  const creatorLoginBtn = document.getElementById("loginOpen");
const creatorLoginDialog = document.getElementById("loginDialog");

if (creatorLoginBtn && creatorLoginDialog) {
  creatorLoginBtn.onclick = function () {
    creatorLoginDialog.showModal();
  };
}
