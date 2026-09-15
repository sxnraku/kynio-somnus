# Política de Privacidade — KYNIO SOMNUS
**Data de Entrada em Vigor:** 15 de Setembro de 2026  
**Versão:** 1.0.0 (Local-First Architecture)  
**Jurisdição Principal:** Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento UE 2016/679) & Legislação Aplicável  

---

### 1. Filosofia Fundamental: Soberania de Dados Local-First
No **KYNIO Somnus**, acreditamos que os teus ritmos biológicos, padrões de sono e hábitos diários são dados íntimos da tua saúde que pertencem exclusivamente a ti. A aplicação foi concebida sob o paradigma **Local-First**:
* **Armazenamento 100% no Dispositivo:** Todos os registos de sono, cafeína, check-ins de energia e coordenadas geográficas são guardados localmente numa base de dados SQLite encriptada no teu próprio smartphone.
* **Sem Contas Obrigatórias:** Podes utilizar o KYNIO Somnus de forma completamente anónima, sem necessidade de introduzir email, nome ou password.
* **Zero Rastreamento de Terceiros:** Não integramos Google Analytics, Facebook Pixel, Mixpanel, Amplitude ou quaisquer corretores de dados (data brokers).

---

### 2. Dados Tratados e Finalidade

| Dado | Finalidade | Onde é Guardado | Transmissão para Servidores Externos? |
| :--- | :--- | :--- | :--- |
| **Coordenadas Geográficas (Latitude/Longitude)** | Cálculo matemático local das equações NOAA (elevação do sol, zénite, nascer e pôr do sol). | Memória e SQLite local | **NUNCA**. Processado exclusivamente no processador do telemóvel. |
| **Registos de Sono & Cafeína** | Cálculo dos ciclos ultradianos de 90 minutos e da curva de eliminação hepática de cafeína. | SQLite local | **NUNCA**. |
| **Check-in Matinal de Energia** | Cálculo do Social Jetlag e Índice de Estabilidade Circadiana. | SQLite local | **NUNCA**. |
| **Identificador Anónimo de Compras (RevenueCat)** | Processamento da subscrição KYNIO Pro através da Apple App Store / Google Play Store. | Servidores RevenueCat / Apple / Google | Sim, estritamente o identificador anónimo de recibo de compra das lojas. |

---

### 3. Direitos dos Titulares dos Dados (RGPD)
Ao abrigo do RGPD, garantimos ferramentas automatizadas integradas na aplicação para exerceres os teus direitos com um clique:
1. **Direito à Portabilidade dos Dados (Artigo 20.º do RGPD):** Podes aceder ao ecrã *Definições* e descarregar todo o teu histórico em formato aberto e legível por máquina (`JSON`).
2. **Direito ao Apagamento / Direito ao Esquecimento (Artigo 17.º do RGPD):** A função *Eliminar Todos os Dados Locais* apaga permanentemente a base de dados SQLite do dispositivo sem deixar rastos.

---

### 4. Contacto do Encarregado de Privacidade
Para qualquer questão relacionada com a privacidade dos teus dados:
* **Entidade:** KYNIO Health Technologies
* **Email de Suporte:** privacy@kyniohealth.com
