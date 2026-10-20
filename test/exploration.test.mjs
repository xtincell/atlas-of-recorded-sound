import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(process.env.ATLAS_HTML || new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const data = JSON.parse(html.split('\n').find(line => line.startsWith('const DATA=')).slice(11, -1));
const families = JSON.parse(html.split('\n').find(line => line.startsWith('const FAM_ORDER=')).slice(16, -1));

function classes() {
  const values = new Set();
  return { add: (...xs) => xs.forEach(x => values.add(x)), remove: (...xs) => xs.forEach(x => values.delete(x)),
    toggle: (x, enabled) => { if (enabled) values.add(x); else values.delete(x); }, contains: x => values.has(x) };
}

// Execute the page's actual input and Enter handlers. Layout and browser history
// remain separate native-browser checks; no provider, dependency or network is used.
function searchHarness() {
  const elements = new Map(['q', 'search', 'search-status', 'qx'].map(id => [id, {
    value: '', textContent: '', classList: classes(), handlers: {}, focus() {},
    addEventListener(event, callback) { this.handlers[event] = callback; },
  }]));
  const nodeEls = new Map(data.nodes.map(n => [n.id, { g: { classList: classes() } }]));
  const opened = [];
  const context = vm.createContext({ nodes: data.nodes, nodeEls, focused: null,
    document: { getElementById: id => elements.get(id) }, cam: { classList: classes() },
    closeDetail() {}, clearFocus() {}, rememberView() {}, openNode: id => opened.push(id),
  });
  const start = script.indexOf('/* ---------- search ---------- */');
  const end = script.indexOf('/* ---------- edge type toggles ---------- */');
  assert.ok(start >= 0 && end > start, 'Search handlers must remain exercisable');
  new vm.Script(script.slice(start, end)).runInContext(context);
  return {
    opened,
    enter(text) {
      const input = elements.get('q'); input.value = text; input.handlers.input();
      const matches = [...nodeEls].filter(([, e]) => e.g.classList.contains('match')).map(([id]) => id);
      input.handlers.keydown({ key: 'Enter', preventDefault() {} });
      return matches;
    },
    clear() { elements.get('qx').onclick(); return elements.get('q').value; },
  };
}

test('the complete inline application parses', () => { new vm.Script(script); });
test('every genre is unique, displayed in a family, and every lineage has both endpoints', () => {
  const ids = new Set(data.nodes.map(n => n.id)); assert.equal(ids.size, data.nodes.length);
  assert.ok(ids.size > 0);
  for (const n of data.nodes) assert.ok(families.includes(n.superGenre), n.id);
  for (const e of data.edges) { assert.ok(ids.has(e.from), e.from); assert.ok(ids.has(e.to), e.to); }
});
for (const [query, expected] of [
  ['Pierre Schaeffer', 'musique-concrete'], ['art music', 'classical-music'],
  ['Musique Concrète', 'musique-concrete'], ['musique concrete', 'musique-concrete'],
]) test(`Enter opens the same genre highlighted by ${query}`, () => {
  const h = searchHarness(); const matches = h.enter(query);
  assert.ok(matches.includes(expected)); assert.deepEqual(h.opened, [expected]);
});
for (const query of ['', 'zzzz-no-such-genre']) test(`an absent result never opens an unrelated genre (${query || 'empty'})`, () => {
  const h = searchHarness(); assert.deepEqual(h.enter(query), []); assert.deepEqual(h.opened, []);
});
test('clearing the search removes the query and every highlighted result', () => {
  const h = searchHarness(); h.enter('Pierre Schaeffer'); assert.equal(h.clear(), '');
  assert.deepEqual(h.enter(''), []);
});

test('None removes every family instead of retaining the first one', () => {
  const buttons = families.map(() => ({ pressed: 'true', setAttribute(_key, value) { this.pressed = value; } }));
  const control = {};
  const context = vm.createContext({ visible: new Set(families), FAM_ORDER: families, relayout() {},
    document: { getElementById: () => control, querySelectorAll: () => buttons },
  });
  const actualHandler = script.split('\n').find(line => line.startsWith('document.getElementById("allOff").onclick='));
  assert.ok(actualHandler); new vm.Script(actualHandler).runInContext(context); control.onclick();
  assert.equal(context.visible.size, 0); assert.ok(buttons.every(b => b.pressed === 'false'));
});
