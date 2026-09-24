let runtime;

self.onmessage = async ({ data }) => {
  const { id, code, inputs, tests, runtimeURL } = data;
  try {
    if (!runtime) {
      const { loadPyodide } = await import(/* @vite-ignore */ runtimeURL);
      runtime = await loadPyodide({ indexURL: runtimeURL.slice(0, runtimeURL.lastIndexOf('/') + 1) });
    }
    self.postMessage({ id, phase: 'ready' });
    const output = [];
    const append = line => { if (output.join('\n').length < 12000) output.push(String(line)); };
    runtime.setStdout({ batched: append });
    runtime.setStderr({ batched: append });
    // A new globals dictionary prevents ordinary exercise variables leaking between runs.
    const globals = runtime.globals.get('dict')();
    const inputSetup = `_practice_inputs = iter(${JSON.stringify(inputs)})\ndef input(prompt=''):\n    print(prompt, end='')\n    try:\n        return next(_practice_inputs)\n    except StopIteration:\n        raise EOFError('أضف قيمة إلى خانة المدخلات التجريبية')\n`;
    try {
      await runtime.runPythonAsync(inputSetup + '\n' + code, { globals });
      let passed = false;
      try {
        await runtime.runPythonAsync(tests, { globals });
        passed = true;
      } catch (error) {
        append('لم تجتز حالة الاختبار: ' + String(error.message || error).slice(0, 1200));
      }
      self.postMessage({ id, output: output.join('\n').slice(0, 12000), passed });
    } finally {
      globals.destroy();
    }
  } catch (error) {
    self.postMessage({ id, output: String(error.message || error).slice(0, 2000), passed: false });
  }
};
