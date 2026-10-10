const $ = s => document.querySelector(s),
    $$ = s => [...document.querySelectorAll(s)];
const API = "https://api.rss2json.com/v1/api.json?rss_url=";
const CAT = {
    "Frontend": ["#2563eb", "#dbeafe", "#1e40af"],
    "Design": ["#ec4899", "#fce7f3", "#9d174d"],
    "Backend & DevOps": ["#f59e0b", "#fef3c7", "#78350f"],
    "General Tech": ["#6366f1", "#e5e7eb", "#374151"],
    "AI & ML": ["#8b5cf6", "#ede9fe", "#5b21b6"],
    "Edge Cases": ["#9ca3af", "#f3f4f6", "#4b5563"]
};
const PAL = ["#d33a2c", "#f48120", "#111827", "#4f46e5", "#0a7bbd", "#2563eb", "#8b5cf6", "#0f9d6a", "#e5533d", "#0891b2"];
const store = {
    get(k, d) {
        try {
            return JSON.parse(localStorage.getItem(k)) ?? d
        } catch {
            return d
        }
    },
    set(k, v) {
        try {
            localStorage.setItem(k, JSON.stringify(v))
        } catch {}
    }
};
const read = new Set(store.get("fp.read", [])),
    saved = new Set(store.get("fp.saved", [])),
    unf = new Set(store.get("fp.unf", []));
const custom = store.get("fp.custom", []);
const st = {
    f: "all",
    v: "",
    sort: "new",
    q: "",
    tab: "feed",
    limit: 40,
    fatal: ""
};
let feeds = [],
    items = [],
    pending = [],
    known = new Set(),
    dups = [];
const esc = s => s.replace(/[&<>"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
} [c]));
const clean = (h, n) => {
    const t = (new DOMParser().parseFromString(h || "", "text/html").body.textContent || "").replace(/\s+/g, " ").trim();
    return n && t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t
};
const color = t => PAL[[...t].reduce((a, c) => a + c.charCodeAt(0), 0) % PAL.length];
const active = () => feeds.filter(f => !unf.has(f.feedUrl));
const byUrl = u => feeds.find(f => f.feedUrl === u);
const mine = () => items.filter(i => !unf.has(i.feed));

function toast(m) {
    const t = $("#toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2200)
}

function ago(d) {
    const m = Math.max(1, Math.round((Date.now() - d) / 6e4));
    return m < 60 ? m + "m ago" : m < 1440 ? Math.round(m / 60) + "h ago" : Math.round(m / 1440) + "d ago"
}

function day(d) {
    const s = new Date().setHours(0, 0, 0, 0),
        x = new Date(d).setHours(0, 0, 0, 0),
        n = Math.round((s - x) / 864e5);
    return n <= 0 ? "TODAY" : n === 1 ? "YESTERDAY" : new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    }).toUpperCase()
}

function addFeed(f, cat) {
    if (feeds.some(x => x.feedUrl === f.feedUrl)) {
        dups.push(f.title);
        return
    }
    feeds.push({
        ...f,
        cat,
        status: "loading"
    })
}
async function pull(f) {
    const r = await fetch(API + encodeURIComponent(f.feedUrl)),
        j = await r.json();
    if (j.status !== "ok") throw new Error(j.message || "Feed error");
    if (!f.custom && j.feed && j.feed.title && f.format === "unknown") f.title = j.feed.title;
    return (j.items || []).map(i => {
        const p = i.pubDate || "",
            d = /^\d{4}-\d\d-\d\d \d\d:\d\d/.test(p) ? new Date(p.replace(" ", "T") + "Z") : new Date(p);
        return {
            id: f.feedUrl + "|" + (i.guid || i.link),
            feed: f.feedUrl,
            src: f.title,
            cat: f.cat,
            link: i.link,
            title: clean(i.title),
            desc: clean(i.description || i.content, 280),
            time: isNaN(d) ? new Date() : d
        }
    });
}
async function loadAll(first) {
    const q = active().slice();
    const worker = async () => {
        while (q.length) {
            const f = q.shift();
            try {
                const a = await pull(f);
                f.status = "ok";
                a.forEach(i => {
                    if (known.has(i.id)) return;
                    known.add(i.id);
                    (first ? items : pending).push(i)
                })
            } catch (e) {
                f.status = "error";
                f.err = e.message
            }
            render()
        }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    render();
}

function unreadOf(a) {
    return a.filter(i => !read.has(i.id)).length
}

function side() {
    const act = active(),
        cats = [...new Set(act.map(f => f.cat))],
        all = mine();
    $("#cats").innerHTML = cats.map(c => {
        const fs = act.filter(f => f.cat === c),
            n = unreadOf(all.filter(i => i.cat === c));
        return `<button class="cat${st.f==="c:"+c?" on":""}" data-f="c:${esc(c)}"><span class="dot" style="background:${CAT[c]?CAT[c][0]:"#999"}"></span>${esc(c)}<b>${n}</b></button>` +
            fs.map(f => {
                const n = unreadOf(all.filter(i => i.feed === f.feedUrl));
                return `<button class="fd${st.f==="s:"+f.feedUrl?" on":""}" data-f="s:${esc(f.feedUrl)}" title="${esc(f.notes||f.description||"")}"><span class="fav" style="background:${color(f.title)}">${esc(f.title[0])}</span>${esc(f.title)}<b class="${f.status==="error"?"err":""}">${f.status==="loading"?"…":f.status==="error"?"!":n}</b></button>`
            }).join("")
    }).join("");
    $$(".nav").forEach(n => n.classList.toggle("on", n.dataset.f === st.f));
    $("#cAll").textContent = unreadOf(all);
    $("#cSaved").textContent = saved.size;
    const bad = act.filter(f => f.status === "error").length,
        ld = act.some(f => f.status === "loading"),
        h = $("#health");
    h.className = "healthy" + (bad ? " bad" : "");
    const c = bad ? "#dc2626" : "#16a34a";
    h.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="${c}" stroke-width="1.4"><circle cx="8" cy="8" r="6"/>${bad?'<path d="M8 4.8v3.8M8 11v.1"/>':'<path d="m5.5 8 1.8 1.8L10.8 6.3"/>'}</svg>` + (ld ? "Checking feeds…" : bad ? `${bad} feed${bad>1?"s":""} failing` : "All feeds healthy");
}

function vis() {
    const f = st.f;
    let a = mine().filter(x => f === "all" || (f === "saved" ? saved.has(x.id) : f.startsWith("c:") ? x.cat === f.slice(2) : x.feed === f.slice(2)));
    if (st.q) {
        const q = st.q.toLowerCase();
        a = a.filter(x => (x.title + x.desc + x.src).toLowerCase().includes(q))
    }
    return a.sort((p, q) => st.sort === "new" ? q.time - p.time : p.time - q.time);
}

function fname() {
    const f = st.f;
    return f === "all" ? "All Items" : f === "saved" ? "Saved" : f.startsWith("c:") ? f.slice(2) : (byUrl(f.slice(2)) || {}).title || "Feed"
}

function render() {
    side();
    $$(".tab").forEach(t => t.classList.toggle("on", t.dataset.t === st.tab));
    const feed = $("#feed"),
        top = $(".top"),
        ban = $("#banner"),
        isFeed = st.tab === "feed";
    $("#title").textContent = isFeed ? fname() : st.tab[0].toUpperCase() + st.tab.slice(1);
    ban.style.display = pending.length && isFeed ? "flex" : "none";
    $("#bn").textContent = pending.length;
    top.querySelectorAll(".seg,.btn").forEach(e => e.style.display = isFeed ? "" : "none");
    if (st.fatal) {
        feed.innerHTML = `<div class="empty">${st.fatal}</div>`;
        return
    }
    if (st.tab === "digest") {
        $("#sub").textContent = "";
        const t = mine().filter(i => !read.has(i.id)).sort((a, b) => b.time - a.time).slice(0, 5);
        feed.innerHTML = `<div class="pane"><h2>Your digest</h2>${t.map(a=>`<div class="row"><div><a href="${esc(a.link)}" target="_blank" rel="noopener">${esc(a.title)}</a><small>${esc(a.src)} · ${ago(a.time)}</small></div></div>`).join("")||"<p>You're all caught up.</p>"}</div>`;
        return
    }
    if (st.tab === "discover") {
        $("#sub").textContent = "";
        feed.innerHTML = `<div class="pane"><h2>Discover sources</h2>${feeds.map(f=>`<div class="row"><span class="fav" style="background:${color(f.title)};width:18px;height:18px">${esc(f.title[0])}</span><div><b style="color:var(--ink)">${esc(f.title)}</b> <small style="display:inline">${esc(f.format)}</small><small>${esc(f.description||"")}${f.notes?" — "+esc(f.notes):""}</small></div><button class="btn" style="margin-left:auto" data-follow="${esc(f.feedUrl)}">${unf.has(f.feedUrl)?"Follow":"Following"}</button></div>`).join("")}${dups.length?`<p><small>Skipped duplicate: ${esc(dups.join(", "))}</small></p>`:""}</div>`;
        return
    }
    const a = vis();
    $("#sub").textContent = unreadOf(a) + " unread";
    if (!a.length) {
        feed.innerHTML = `<div class="empty">${active().some(f=>f.status==="loading")?"Loading your feeds…":"Nothing here yet. Try another category or clear your search."}</div>`;
        return
    }
    let html = "",
        last = "",
        open = false;
    a.slice(0, st.limit).forEach(x => {
        const d = day(x.time);
        if (d !== last) {
            if (open) html += "</div>";
            html += `<div class="day">${d}</div><div class="list ${st.v}">`;
            last = d;
            open = true
        }
        const t = CAT[x.cat] || CAT["Edge Cases"];
        html += `<article class="item${read.has(x.id)?" read":""}" data-id="${esc(x.id)}"><span class="unread"></span><div class="meta"><span class="fav" style="background:${color(x.src)}">${esc(x.src[0])}</span>${esc(x.src)}<span>·</span>${ago(x.time)}</div><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p><span class="tag" style="background:${t[1]};color:${t[2]}">${esc(x.cat)}</span><button class="save${saved.has(x.id)?" on":""}" data-s="1" aria-label="Save"><svg width="15" height="15" viewBox="0 0 16 16" fill="${saved.has(x.id)?"currentColor":"none"}" stroke="currentColor" stroke-width="1.4"><path d="M4 2.5h8v11L8 10.5 4 13.5z"/></svg></button></article>`
    });
    if (open) html += "</div>";
    if (a.length > st.limit) html += `<button class="btn more" data-more="1">Show more (${a.length-st.limit} left)</button>`;
    feed.innerHTML = html;
}
const keep = () => {
    store.set("fp.read", [...read]);
    store.set("fp.saved", [...saved]);
    store.set("fp.unf", [...unf])
};
async function addCustom() {
    const u = prompt("Paste a feed URL to follow:", "https://");
    if (!u || u.length < 9 || feeds.some(f => f.feedUrl === u)) return u && toast("Already following that feed");
    const f = {
        title: u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0],
        feedUrl: u,
        description: "Custom feed",
        format: "unknown",
        custom: 1,
        cat: "General Tech",
        status: "loading"
    };
    feeds.push(f);
    render();
    try {
        const a = await pull(f);
        f.status = "ok";
        a.forEach(i => {
            known.add(i.id);
            items.push(i)
        });
        custom.push({
            title: f.title,
            feedUrl: u,
            description: f.description,
            format: "unknown",
            custom: 1,
            cat: "General Tech"
        });
        store.set("fp.custom", custom);
        toast("Feed added")
    } catch (e) {
        f.status = "error";
        toast("Couldn't read that feed: " + e.message)
    }
    render();
}
document.addEventListener("click", e => {
    const dot = e.target.closest(".unread");
    if (dot) {
        const id = dot.closest(".item").dataset.id;
        read.has(id) ? read.delete(id) : read.add(id);
        keep();
        render();
        return
    }
    const c = e.target.closest("button,.item");
    if (!c) {
        $("#menu").classList.remove("show");
        return
    }
    if (!c.closest(".menu") && c.id !== "av") $("#menu").classList.remove("show");
    if (c.dataset.f) {
        st.f = c.dataset.f;
        st.tab = "feed";
        st.limit = 40;
        render()
    } else if (c.dataset.t) {
        st.tab = c.dataset.t;
        render()
    } else if (c.dataset.follow) {
        const u = c.dataset.follow;
        unf.has(u) ? unf.delete(u) : unf.add(u);
        keep();
        if (unf.has(u) && st.f === "s:" + u) st.f = "all";
        render();
        if (!unf.has(u) && byUrl(u).status === "loading") loadAll(true)
    } else if (c.dataset.more) {
        st.limit += 40;
        render()
    } else if (c.dataset.v !== undefined && c.closest("#views")) {
        st.v = c.dataset.v;
        $$("#views button").forEach(b => b.classList.toggle("on", b === c));
        render()
    } else if (c.id === "sort") {
        st.sort = st.sort === "new" ? "old" : "new";
        c.querySelector("span").textContent = st.sort === "new" ? "Newest" : "Oldest";
        render()
    } else if (c.id === "refresh") {
        const i = $("#rIc");
        i.classList.remove("spin");
        void i.offsetWidth;
        i.classList.add("spin");
        active().forEach(f => f.status = "loading");
        render();
        loadAll(false).then(() => toast(pending.length ? pending.length + " new items available" : "Feeds are up to date"))
    } else if (c.id === "markall") {
        vis().forEach(x => read.add(x.id));
        keep();
        toast("Marked as read");
        render()
    } else if (c.id === "banner") {
        items = items.concat(pending);
        pending = [];
        st.sort = "new";
        $("#sort span").textContent = "Newest";
        render();
        $("#feed").scrollTop = 0
    } else if (c.id === "add") addCustom();
    else if (c.id === "av") $("#menu").classList.toggle("show");
    else if (c.dataset.m) {
        $("#menu").classList.remove("show");
        const m = c.dataset.m,
            r = document.documentElement;
        if (m === "theme") {
            const d = r.dataset.theme === "dark" || (!r.dataset.theme && matchMedia("(prefers-color-scheme:dark)").matches);
            r.dataset.theme = d ? "light" : "dark"
        }
        if (m === "saved") {
            st.f = "saved";
            st.tab = "feed";
            render()
        }
        if (m === "reset") {
            ["fp.read", "fp.saved", "fp.unf", "fp.custom"].forEach(k => localStorage.removeItem(k));
            location.reload()
        }
    } else if (c.id === "health") {
        const b = active().filter(f => f.status === "error");
        toast(b.length ? "Failing: " + b.map(f => f.title).join(", ") : "All feeds responded")
    } else if (c.dataset.s) {
        const id = c.closest(".item").dataset.id;
        saved.has(id) ? saved.delete(id) : saved.add(id);
        keep();
        toast(saved.has(id) ? "Saved" : "Removed from saved");
        render()
    } else if (c.classList.contains("item")) {
        const x = items.find(a => a.id === c.dataset.id);
        read.add(c.dataset.id);
        keep();
        if (x && x.link) window.open(x.link, "_blank", "noopener");
        render()
    }
});
$("#q").addEventListener("input", e => {
    st.q = e.target.value;
    st.tab = "feed";
    render()
});
document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        $("#q").focus()
    }
    if (e.key === "Escape") $("#q").blur()
});
async function init() {
    render();
    let d;
    try {
        const r = await fetch("data/sample-feeds.json");
        d = await r.json()
    } catch {
        st.fatal = "Couldn't load <b>data/sample-feeds.json</b>. Browsers block this when the page is opened as a file, so serve the folder with <code>python3 -m http.server</code> and open <code>localhost:8000</code>.";
        render();
        return
    }
    d.categories.forEach(c => c.feeds.forEach(f => addFeed(f, c.name)));
    (d.edgeCases || []).forEach(f => addFeed(f, "Edge Cases"));
    custom.forEach(f => addFeed(f, f.cat));
    render();
    await loadAll(true);
}
init();