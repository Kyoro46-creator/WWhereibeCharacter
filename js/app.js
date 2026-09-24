const $ = (id) => document.getElementById(id);

const cfg = window.APP_CONFIG || {};

let sb = null;
let chars = [];
let user = null;
let selected = null;

let currentLang = localStorage.getItem("siteLang") || "id";

/* =========================================================
   TRANSLATION
========================================================= */

const translations = {
  id: {
    title: "WORLD WHERE I BE UNIVERS",
    subtitle: "Database karakter Cerita Original Nan46.",
    login: "CREATOR LOGIN",
    logout: "Logout",
    add: "+ Tambah Karakter",
    search: "Cari karakter...",
    allStories: "Semua Cerita",
    chapter: "Chapter terakhir",
    allGroups: "Semua Kelompok",
    empty: "Belum ada karakter.",
    edit: "Edit Karakter",
    addTitle: "Tambah Karakter",
    save: "Simpan",
    delete: "Hapus",

    role: "Peran",
    age: "Umur",
    height: "Tinggi",
    hair: "Rambut",
    eyes: "Mata",
    power: "Kekuatan",
    weapon: "Senjata",
    group: "Kelompok",
    city: "Kota / Lokasi",
    story: "Cerita",
    firstChapter: "Pertama Muncul",
    description: "Deskripsi",
    noDescription: "Belum ada deskripsi.",
    noPhoto: "Tanpa Foto"
  },

  en: {
    title: "WORLD WHERE I BE UNIVERS",
    subtitle: "Original Story Character Database by Nan46.",
    login: "CREATOR LOGIN",
    logout: "Logout",
    add: "+ Add Character",
    search: "Search characters...",
    allStories: "All Stories",
    chapter: "Latest chapter",
    allGroups: "All Groups",
    empty: "No characters yet.",
    edit: "Edit Character",
    addTitle: "Add Character",
    save: "Save",
    delete: "Delete",

    role: "Role",
    age: "Age",
    height: "Height",
    hair: "Hair",
    eyes: "Eyes",
    power: "Power / Element",
    weapon: "Weapon",
    group: "Group",
    city: "City / Location",
    story: "Story",
    firstChapter: "First Appearance",
    description: "Description",
    noDescription: "No description yet.",
    noPhoto: "No Photo"
  }
};

function t() {
  return translations[currentLang] || translations.id;
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]
  );
}

/* =========================================================
   LANGUAGE
========================================================= */

function applyLanguage() {
  const lang = t();

  const heroTitle = document.querySelector(".hero h1");
  const heroSubtitle = document.querySelector(".hero p");

  if (heroTitle) heroTitle.textContent = lang.title;
  if (heroSubtitle) heroSubtitle.textContent = lang.subtitle;

  if ($("loginOpen")) $("loginOpen").textContent = lang.login;
  if ($("logout")) $("logout").textContent = lang.logout;
  if ($("addOpen")) $("addOpen").textContent = lang.add;

  if ($("search")) $("search").placeholder = lang.search;

  if ($("chapterFilter")) {
    $("chapterFilter").placeholder = lang.chapter;
  }

  if ($("empty")) $("empty").textContent = lang.empty;

  if ($("langToggle")) {
    $("langToggle").textContent =
      currentLang === "id" ? "EN" : "ID";
  }

  if ($("storyFilter")) {
    const first = $("storyFilter").querySelector(
      'option[value=""]'
    );

    if (first) first.textContent = lang.allStories;
  }

  updateGroupOptions();
}

/* =========================================================
   AUTH UI
========================================================= */

function authUI() {
  const loginOpen = $("loginOpen");
  const logout = $("logout");
  const addOpen = $("addOpen");
  const editBtn = $("editBtn");

  if (loginOpen) loginOpen.classList.toggle("hidden", !!user);
  if (logout) logout.classList.toggle("hidden", !user);
  if (addOpen) addOpen.classList.toggle("hidden", !user);
  if (editBtn) editBtn.classList.toggle("hidden", !user);

  // Mode Creator
  const chapterFilter = $("chapterFilter");
  const storyFilter = $("storyFilter");
  const copyReaderLink = $("copyReaderLink");

  if (user) {
  // CREATOR MODE
  if (chapterFilter) {
    chapterFilter.classList.remove("hidden");
    chapterFilter.style.display = "";
    chapterFilter.value = "";
  if (copyReaderLink) {
  copyReaderLink.classList.remove("hidden");  
  }

  if (storyFilter) {
    storyFilter.value = "";
  }

  if (typeof render === "function") {
    render();
  }

} else {
    // READER MODE

    if (copyReaderLink) {
        copyReaderLink.classList.add("hidden");
    }

    const params = new URLSearchParams(window.location.search);
    const chapterFromLink = params.get("chapter");

    if (chapterFilter) {
        chapterFilter.value = chapterFromLink || "1";
        chapterFilter.classList.add("hidden");
    }
}
}

/* =========================================================
   STATUS
========================================================= */

function showStatus(message, isError = false) {
  const status = $("status");

  if (!status) return;

  status.textContent = message;

  if (!message) {
    status.classList.add("hidden");
    status.classList.remove("error");
    return;
  }

  status.classList.remove("hidden");
  status.classList.toggle("error", isError);
}

/* =========================================================
   LOAD CHARACTERS
========================================================= */

async function load() {
  if (!sb) return;

  showStatus("");

  const { data, error } = await sb
    .from("characters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    showStatus(error.message, true);
    return;
  }

  chars = data || [];

  updateGroupOptions();
  render();
}

/* =========================================================
   GROUP FILTER
========================================================= */

function updateGroupOptions() {
  const groupFilter = $("groupFilter");

  if (!groupFilter) return;

  const previous = groupFilter.value;

  const groups = [
    ...new Set(
      chars
        .map((char) => char.group_name)
        .filter(Boolean)
    )
  ].sort();

  groupFilter.innerHTML =
    `<option value="">${esc(t().allGroups)}</option>` +
    groups
      .map(
        (group) =>
          `<option value="${esc(group)}">${esc(group)}</option>`
      )
      .join("");

  if (groups.includes(previous)) {
    groupFilter.value = previous;
  }
}

/* =========================================================
   RENDER
========================================================= */

function render() {
  const grid = $("grid");

  if (!grid) return;

  const query = ($("search")?.value || "")
    .trim()
    .toLowerCase();

  const group = $("groupFilter")?.value || "";
  const story = $("storyFilter")?.value || "";

  const chapterValue = $("chapterFilter")?.value || "";
  const chapter = chapterValue
    ? Number(chapterValue)
    : null;

  const rows = chars.filter((char) => {
    const searchable = [
      char.name,
      char.role,
      char.power,
      char.weapon,
      char.group_name,
      char.city,
      char.description,
      char.story
    ]
      .join(" ")
      .toLowerCase();

    const searchMatch =
      !query || searchable.includes(query);

    const groupMatch =
      !group || char.group_name === group;

    const storyMatch =
      !story || char.story === story;

    /*
      SPOILER / CHAPTER SYSTEM

      Jika pembaca memasukkan Chapter 10,
      karakter yang pertama muncul setelah Chapter 10
      tidak akan ditampilkan.
    */

    let chapterMatch = true;

    if (chapter !== null) {
      const firstChapter =
        Number(char.first_chapter) || 1;

      chapterMatch = firstChapter <= chapter;
    }

    return (
      searchMatch &&
      groupMatch &&
      storyMatch &&
      chapterMatch
    );
  });

  grid.innerHTML = rows
    .map((char) => {
      const image = char.image_url
        ? `<img src="${esc(char.image_url)}" alt="${esc(
            char.name || "Character"
          )}">`
        : `<div class="noimg">${esc(t().noPhoto)}</div>`;

      const tags = [
        char.story,
        char.power,
        char.weapon,
        char.group_name
      ]
        .filter(Boolean)
        .map(
          (value) =>
            `<span class="tag">${esc(value)}</span>`
        )
        .join("");

      return `
        <article class="card" data-id="${esc(char.id)}">

          ${image}

          <div class="body">

            <h3>${esc(char.name || "")}</h3>

            <div class="muted">
              ${esc(char.role || "")}
            </div>

            <div class="tags">
              ${tags}
            </div>

          </div>

        </article>
      `;
    })
    .join("");

  if ($("empty")) {
    $("empty").classList.toggle(
      "hidden",
      rows.length > 0
    );
  }

  document
    .querySelectorAll(".card")
    .forEach((card) => {
      card.addEventListener("click", () => {
        detail(card.dataset.id);
      });
    });
}

/* =========================================================
   CHARACTER DETAIL
========================================================= */

function detail(id) {
  const char = chars.find(
    (item) => String(item.id) === String(id)
  );

  if (!char) return;

  selected = char;

  if ($("detailName")) {
    $("detailName").textContent =
      char.name || "";
  }

  if ($("detailDesc")) {
    $("detailDesc").textContent =
      char.description || t().noDescription;
  }

  if ($("detailImage")) {
    if (char.image_url) {
      $("detailImage").src = char.image_url;
      $("detailImage").classList.remove("hidden");
    } else {
      $("detailImage").removeAttribute("src");
      $("detailImage").classList.add("hidden");
    }
  }

  const metadata = [
    [t().role, char.role],
    [t().age, char.age],
    [t().height, char.height],
    [t().hair, char.hair],
    [t().eyes, char.eyes],
    [t().power, char.power],
    [t().weapon, char.weapon],
    [t().group, char.group_name],
    [t().city, char.city],
    [t().story, char.story],
    [
      t().firstChapter,
      char.first_chapter
        ? `Chapter ${char.first_chapter}`
        : null
    ]
  ].filter((item) => item[1]);

  if ($("detailMeta")) {
    $("detailMeta").innerHTML = metadata
      .map(
        ([label, value]) => `
          <div>
            <b>${esc(label)}</b>
            ${esc(value)}
          </div>
        `
      )
      .join("");
  }

  if ($("editBtn")) {
    $("editBtn").textContent = t().edit;
    $("editBtn").classList.toggle(
      "hidden",
      !user
    );
  }

  $("detailDialog")?.showModal();
}

/* =========================================================
   RESET CHARACTER FORM
========================================================= */

function resetForm() {
  $("charForm")?.reset();

  if ($("id")) $("id").value = "";
  if ($("oldImage")) $("oldImage").value = "";

  if ($("story")) {
    $("story").value = "Where I Be";
  }

  if ($("first_chapter")) {
    $("first_chapter").value = "1";
  }

  if ($("preview")) {
    $("preview").removeAttribute("src");
    $("preview").classList.add("hidden");
  }

  if ($("deleteBtn")) {
    $("deleteBtn").classList.add("hidden");
    $("deleteBtn").textContent = t().delete;
  }

  if ($("formTitle")) {
    $("formTitle").textContent =
      t().addTitle;
  }
}

/* =========================================================
   EDIT CHARACTER
========================================================= */

function editCharacter(char) {
  if (!char) return;

  resetForm();

  const fields = [
    "name",
    "role",
    "age",
    "height",
    "hair",
    "eyes",
    "power",
    "weapon",
    "group_name",
    "city",
    "description",
    "story",
    "first_chapter"
  ];

  fields.forEach((field) => {
    const element = $(field);

    if (!element) return;

    if (field === "first_chapter") {
      element.value =
        char[field] ?? 1;
    } else if (field === "story") {
      element.value =
        char[field] || "Where I Be";
    } else {
      element.value =
        char[field] ?? "";
    }
  });

  if ($("id")) {
    $("id").value = char.id;
  }

  if ($("oldImage")) {
    $("oldImage").value =
      char.image_url || "";
  }

  if (char.image_url && $("preview")) {
    $("preview").src = char.image_url;
    $("preview").classList.remove("hidden");
  }

  if ($("deleteBtn")) {
    $("deleteBtn").classList.remove("hidden");
  }

  if ($("formTitle")) {
    $("formTitle").textContent = t().edit;
  }

  $("detailDialog")?.close();
  $("charDialog")?.showModal();
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

async function uploadImage(file) {
  if (!file) return null;

  const extension =
    file.name.split(".").pop() || "jpg";

  const path =
    Date.now() +
    "-" +
    crypto.randomUUID() +
    "." +
    extension;

  const { error } = await sb.storage
    .from("character-images")
    .upload(path, file);

  if (error) throw error;

  const { data } = sb.storage
    .from("character-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

/* =========================================================
   SAVE CHARACTER
========================================================= */

async function saveCharacter(event) {
  event.preventDefault();

  if (!sb || !user) {
    alert("Silakan login sebagai Creator terlebih dahulu.");
    return;
  }

  try {
    let image =
      $("oldImage")?.value || null;

    const newImage =
      $("image")?.files?.[0];

    if (newImage) {
      image = await uploadImage(newImage);
    }

    const payload = {
      name: $("name").value.trim(),

      role:
        $("role").value.trim() || null,

      age:
        $("age").value.trim() || null,

      height:
        $("height").value.trim() || null,

      hair:
        $("hair").value.trim() || null,

      eyes:
        $("eyes").value.trim() || null,

      power:
        $("power").value.trim() || null,

      weapon:
        $("weapon").value.trim() || null,

      group_name:
        $("group_name").value.trim() || null,

      city:
        $("city").value.trim() || null,

      description:
        $("description").value.trim() || null,

      story:
        $("story")?.value || "Where I Be",

      first_chapter:
        Number($("first_chapter")?.value) || 1,

      image_url: image
    };

    const id = $("id")?.value;

    let result;

    if (id) {
      result = await sb
        .from("characters")
        .update(payload)
        .eq("id", id);
    } else {
      result = await sb
        .from("characters")
        .insert(payload);
    }

    if (result.error) {
      throw result.error;
    }

    $("charDialog")?.close();

    await load();
  } catch (error) {
    console.error(error);
    alert(error.message || "Gagal menyimpan karakter.");
  }
}

/* =========================================================
   DELETE CHARACTER
========================================================= */

async function deleteCharacter() {
  if (!user) return;

  const id = $("id")?.value;

  if (!id) return;

  const confirmed = confirm(
    currentLang === "id"
      ? "Hapus karakter ini?"
      : "Delete this character?"
  );

  if (!confirmed) return;

  const { error } = await sb
    .from("characters")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  $("charDialog")?.close();

  await load();
}

/* =========================================================
   LOGIN
========================================================= */

async function login(event) {
  event.preventDefault();

  if (!sb) return;

  const email = $("email")?.value || "";
  const password =
    $("password")?.value || "";

  const { error } =
    await sb.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    alert(error.message);
    return;
  }

  $("loginDialog")?.close();
}

/* =========================================================
   INITIALIZE SUPABASE
========================================================= */

async function initializeSupabase() {
  if (
    !cfg.SUPABASE_URL ||
    !cfg.SUPABASE_ANON_KEY ||
    cfg.SUPABASE_URL.includes("PASTE_") ||
    cfg.SUPABASE_ANON_KEY.includes("PASTE_")
  ) {
    showStatus(
      "Isi js/config.js dengan Supabase Project URL dan publishable/anon key.",
      true
    );

    return;
  }

  try {
    sb = supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );

    const { data } =
      await sb.auth.getSession();

    user = data.session?.user || null;

    authUI();

    sb.auth.onAuthStateChange(
      (_event, session) => {
        user = session?.user || null;
        authUI();
      }
    );

    await load();
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
  }
}

/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {
  /* Language */

  $("langToggle")?.addEventListener(
    "click",
    () => {
      currentLang =
        currentLang === "id"
          ? "en"
          : "id";

      localStorage.setItem(
        "siteLang",
        currentLang
      );

      applyLanguage();
      render();
    }
  );

  /* Login button */

  $("loginOpen")?.addEventListener(
    "click",
    () => {
      $("loginDialog")?.showModal();
    }
  );

  /* Login form */

  $("loginForm")?.addEventListener(
    "submit",
    login
  );

  /* Logout */

  $("logout")?.addEventListener(
    "click",
    async () => {
      if (sb) {
        await sb.auth.signOut();
      }
    }
  );

  /* Add Character */

  $("addOpen")?.addEventListener(
    "click",
    () => {
      resetForm();
      $("charDialog")?.showModal();
    }
  );

  /* Edit Character */

  $("editBtn")?.addEventListener(
    "click",
    () => {
      if (selected) {
        editCharacter(selected);
      }
    }
  );

  /* Save Character */

  $("charForm")?.addEventListener(
    "submit",
    saveCharacter
  );

  /* Delete Character */

  $("deleteBtn")?.addEventListener(
    "click",
    deleteCharacter
  );

  /* Image Preview */

  $("image")?.addEventListener(
    "change",
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file || !$("preview")) return;

      $("preview").src =
        URL.createObjectURL(file);

      $("preview").classList.remove(
        "hidden"
      );
    }
  );

  /* Search */

  $("search")?.addEventListener(
    "input",
    render
  );

  /* Story */

  $("storyFilter")?.addEventListener(
    "change",
    render
  );

  /* Chapter */

  $("chapterFilter")?.addEventListener(
    "input",
    render
  );

  /* Group */

  $("groupFilter")?.addEventListener(
    "change",
    render
  );

  /* Close Dialog Buttons */

  document
    .querySelectorAll("[data-close]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const dialog =
            $(button.dataset.close);

          if (dialog) {
            dialog.close();
          }
        }
      );
    });
}

/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    setupEvents();

    applyLanguage();

    authUI();

    // Membaca story dan chapter dari link
    const params = new URLSearchParams(window.location.search);

const storyFromLink = params.get("story");
const chapterFromLink = params.get("chapter");

// Jika tidak ada story/chapter di URL,
// gunakan Where I Be Chapter 1 sebagai tampilan aman
const activeStory = storyFromLink || "Where I Be";
const activeChapter = chapterFromLink || "1";

if ($("storyFilter")) {
  $("storyFilter").value = activeStory;
}

if ($("chapterFilter")) {
  $("chapterFilter").value = activeChapter;

  // Sembunyikan pilihan chapter dari pengunjung
  $("chapterFilter").classList.add("hidden");
}

await initializeSupabase();
  }
);
