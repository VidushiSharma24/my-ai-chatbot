// AI ka markdown jawab -> safe, colorful HTML
// marked  = markdown ko HTML me badalta hai
// DOMPurify = HTML ko sanitize karta hai (XSS se bachata hai)
// highlight.js = code ko syntax colors deta hai

(function () {
  marked.setOptions({ gfm: true, breaks: true });

  // Saare links naye tab me kholo
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  function addCodeHeaders(container) {
    container.querySelectorAll("pre").forEach((pre) => {
      const code = pre.querySelector("code");
      if (!code) return;

      const langClass = [...code.classList].find((c) => c.startsWith("language-"));
      const language = langClass ? langClass.replace("language-", "") : "code";

      hljs.highlightElement(code);

      const header = document.createElement("div");
      header.className = "code-header";

      const label = document.createElement("span");
      label.textContent = language;

      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "copy-btn";
      copy.textContent = "Copy";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          copy.textContent = "Copied ✓";
        } catch {
          copy.textContent = "Failed";
        }
        setTimeout(() => (copy.textContent = "Copy"), 1500);
      });

      header.append(label, copy);
      pre.before(header);
      pre.classList.add("has-header");
    });
  }

  window.renderMarkdown = function (element, text) {
    const html = DOMPurify.sanitize(marked.parse(text));
    element.innerHTML = html;
    addCodeHeaders(element);
  };
})();