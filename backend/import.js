import admin from "firebase-admin";
import fs from "fs";
import csv from "csv-parser";
import path from "path";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccount.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function normalizeName(name) {
  if (!name && name !== 0) return "";
  return String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const resultados = [];

fs.createReadStream(path.join(__dirname, "alimentos.csv"))
  .pipe(csv({ separator: ";" }))
  .on("data", (data) => {
    resultados.push({
      nome: data.nome,
      nome_lowercase: normalizeName(data.nome),
      energia_kcal: parseFloat(data.energia_kcal) || 0,
      carboidrato_total_g: parseFloat(data.carboidrato_total_g) || 0,
      proteina_g: parseFloat(data.proteina_g) || 0,
      lipidios_g: parseFloat(data.lipidios_g) || 0,
      fibra_alimentar_g: parseFloat(data.fibra_alimentar_g) || 0,
    });
  })
  .on("end", async () => {
    console.log(`Lendo ${resultados.length} alimentos...`);

    const batchSize = 400; // < 500
    let batch = db.batch();
    let count = 0;

    for (let i = 0; i < resultados.length; i++) {
      const docRef = db.collection("alimentos").doc(); // id automático
      batch.set(docRef, resultados[i]);
      count++;

      if (count === batchSize) {
        await batch.commit();
        batch = db.batch();
        count = 0;
        console.log(`Batch enviado até o índice ${i}`);
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    console.log("Importação concluída!");
    process.exit(0);
  })
  .on("error", (err) => {
    console.error("Erro ao ler o CSV:", err);
    process.exit(1);
  });
