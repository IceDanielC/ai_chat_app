import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-dark.css";

const Markdown: React.FC<{ markdownText: string }> = ({ markdownText }) => {
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    const validLanguage = hljs.getLanguage(lang!) ? lang : "plaintext";
    const hightedCode = hljs.highlight(text, {
      language: validLanguage!,
    }).value;
    return `<pre style="max-width: 70vw">
    <code class="hljs ${validLanguage}" style="border-radius: 5px">${hightedCode}</code>
    </pre>`;
  };
  marked.setOptions({
    renderer,
  });
  const markdown = marked.parse(markdownText);

  return <div dangerouslySetInnerHTML={{ __html: markdown }} />;
};

export default Markdown;
