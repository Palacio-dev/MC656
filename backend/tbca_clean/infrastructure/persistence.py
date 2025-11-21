import pandas as pd
import logging
from tbca_clean.domain.models import NUTRI_FIELDS

class CsvRepository:
    """Adapter de persistência para CSV."""

    def save(self, alimentos, filename: str):
        if not alimentos:
            logging.warning("Nenhum dado para salvar!")
            return False

        df = pd.DataFrame(alimentos)
        for c in NUTRI_FIELDS:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors="coerce")
        df.to_csv(filename, index=False, sep=";", encoding="utf-8")
        logging.info("Dados salvos em %s", filename)
        print(df.head(5).to_string(index=False))
        return True