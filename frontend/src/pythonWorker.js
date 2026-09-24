let runtime;

self.onmessage = async ({ data }) => {
  const { id, code, inputs, cases, runtimeURL } = data;
  try {
    if (!runtime) {
      const { loadPyodide } = await import(/* @vite-ignore */ runtimeURL);
      runtime = await loadPyodide({ indexURL: runtimeURL.slice(0, runtimeURL.lastIndexOf('/') + 1) });
    }
    self.postMessage({ id, phase: 'ready' });
    async function run(exampleInputs, check = '') {
      const output = [];
      let size = 0;
      const append = line => {
        const value = String(line);
        if (size < 12000) { output.push(value); size += value.length; }
      };
      runtime.setStdout({ batched: append });
      runtime.setStderr({ batched: append });
      const globals = runtime.globals.get('dict')();
      const setup = `_practice_inputs = iter(${JSON.stringify(exampleInputs)})\ndef input(prompt=''):\n    print(prompt, end='')\n    try:\n        return next(_practice_inputs)\n    except StopIteration:\n        raise EOFError('أضف قيمة إلى خانة المدخلات التجريبية')\n`;
      try {
        await runtime.runPythonAsync(setup + '\n' + code, { globals });
        if (check) await runtime.runPythonAsync(check, { globals });
        return { passed: true, output: output.join('\n').slice(0, 12000) };
      } catch (error) {
        return { passed: false, output: output.join('\n').slice(0, 12000), error: String(error.message || error).slice(0, 1000) };
      } finally {
        globals.destroy();
      }
    }
    const preview = await run(inputs);
    const results = [];
    for (const entry of cases.slice(0, 6)) {
      const result = await run(entry.inputs || [], entry.check);
      results.push({ name: entry.name, passed: result.passed, hint: result.passed ? '' : entry.hint, error: result.passed ? '' : result.error });
    }
    self.postMessage({ id, output: (preview.output + (preview.error ? '\n' + preview.error : '')).trim().slice(0, 12000) || 'لم يطبع البرنامج شيئًا.',
      previewError: preview.passed ? '' : preview.error,
      cases: results, passed: preview.passed && results.length > 0 && results.every(result => result.passed) });
  } catch (error) {
    self.postMessage({ id, output: String(error.message || error).slice(0, 2000), passed: false, cases: [] });
  }
};
