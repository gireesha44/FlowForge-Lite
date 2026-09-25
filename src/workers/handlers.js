function fib(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

export async function executeJob(type, payload = {}) {
  switch (type) {
    case "demo":
      return { message: "FlowForge job completed", echo: payload };
    case "sleep": {
      const ms = Math.min(Math.max(Number(payload.ms || 1000), 0), 60000);
      await new Promise(resolve => setTimeout(resolve, ms));
      return { sleptMs: ms };
    }
    case "cpu": {
      const n = Math.min(Math.max(Number(payload.n || 1000000), 1), 5000000);
      let checksum = 0;
      for (let i = 1; i <= n; i++) checksum = (checksum + (i * 31) % 1000003) % 1000003;
      return { iterations: n, checksum };
    }
    case "unstable": {
      if (payload.fail === true) throw new Error("Intentional failure for retry testing.");
      return { message: "Unstable job succeeded", payload };
    }
    default:
      throw new Error(`No handler for job type: ${type}`);
  }
}
