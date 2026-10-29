# ============================================================
# generate-data.R — simulates all 9 teaching datasets for bioR.
# Fixed seed (20261027): repeated runs are byte-identical except
# data-manifest.json's "generated" timestamp.
# Docs: docs/05 §5, docs/03 §2.3. All data is SIMULATED.
# Run: Rscript tools/generate-data.R
# ============================================================

fa_ <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
source(file.path(dirname(dirname(normalizePath(sub("^--file=", "", fa_[1]), winslash = "/"))),
                 "tools", "lib", "common.R"))
root <- bioR_setup()
suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(readr); library(writexl); library(jsonlite); library(digest)
})
set.seed(20261027)

dir.create(file.path(root, "assets", "data"), showWarnings = FALSE, recursive = TRUE)
dat <- function(f) file.path(root, "assets", "data", f)

# ---------------------------------------------------------------
# 1. pika_physiology.csv — 3 altitude × 2 sex × 10 = 60 individuals
# ---------------------------------------------------------------
n_per_cell <- 10
altitudes <- c(low = 3200, mid = 4100, high = 5000)
grid <- expand.grid(alt = names(altitudes), sex = c("F", "M"))
grid <- grid[order(match(grid$alt, names(altitudes)), grid$sex), ]

phys <- do.call(rbind, lapply(seq_len(nrow(grid)), function(i) {
  a <- grid$alt[i]; s <- grid$sex[i]
  n <- n_per_cell
  mass <- rnorm(n,
    mean = c(low = 175, mid = 172, high = 168)[a] + ifelse(s == "M", 6, 0),
    sd = c(low = 13, mid = 13, high = 12)[a])
  hb <- (152 + c(low = 0, mid = 14, high = 28)[a] + ifelse(s == "F", -4, 0)) *
    exp(rnorm(n, 0, 0.055))
  data.frame(
    altitude_m = altitudes[a], altitude_group = a, sex = s,
    body_mass_g = round(mass, 1),
    body_length_mm = round(118 + 0.42 * mass + rnorm(n, 0, 6), 1),
    hemoglobin_g_l = round(hb, 1),
    hematocrit_pct = round(30 + 0.13 * hb + rnorm(n, 0, 1.5), 1),
    glucose_mmol_l = round(6.8 + rnorm(n, 0, 1.1), 2)
  )
}))
# planted teaching points (docs/03 §2.3): 2 extreme masses + 2 NA hemoglobin
phys$body_mass_g[which(phys$altitude_group == "mid")[3]]  <- 232.0  # P023
phys$body_mass_g[which(phys$altitude_group == "high")[8]] <- 118.0  # P048
na_hb_idx <- c(17, 42)
phys$hemoglobin_g_l[na_hb_idx] <- NA

phys <- tibble(
  id = sprintf("P%03d", 1:60),
  altitude_m = phys$altitude_m,
  altitude_group = factor(phys$altitude_group, levels = c("low", "mid", "high"), ordered = TRUE),
  sex = factor(phys$sex, levels = c("F", "M")),
  body_mass_g = phys$body_mass_g,
  body_length_mm = phys$body_length_mm,
  hemoglobin_g_l = phys$hemoglobin_g_l,
  hematocrit_pct = phys$hematocrit_pct,
  glucose_mmol_l = phys$glucose_mmol_l,
  batch = factor(sprintf("B%d", (seq_len(60) - 1) %% 3 + 1), levels = c("B1", "B2", "B3")),
  measured_on = as.Date("2026-05-01") + ((as.integer(batch) - 1) * 7) + (seq_len(60) %% 3)
)
write_csv(phys, dat("pika_physiology.csv"), na = "")

# ---------------------------------------------------------------
# 2. pika_repeated.csv — 12 ids × 3 timepoints (ICC ≈ 0.5)
# ---------------------------------------------------------------
set.seed(20261027 + 1)
rep_ids <- sprintf("R%02d", 1:12)
id_eff_m <- rnorm(12, 0, 10)   # random intercept: mass
id_eff_h <- rnorm(12, 0, 8)    # random intercept: hemoglobin
tp <- c("T0", "T14", "T28")
tp_day <- c(T0 = 0, T14 = 14, T28 = 28)

repeated <- expand.grid(id = rep_ids, timepoint = factor(tp, levels = tp),
                        stringsAsFactors = FALSE) |>
  arrange(id, timepoint) |>
  mutate(
    id_num = as.integer(sub("R", "", id)),
    treatment = factor(ifelse(id_num <= 6, "control", "hypoxia"),
                       levels = c("control", "hypoxia")),
    day = tp_day[as.character(timepoint)],
    body_mass_g = round(170 + id_eff_m[match(id, rep_ids)] +
      ifelse(treatment == "hypoxia", -0.30, 0.08) * day + rnorm(n(), 0, 9), 1),
    hemoglobin_g_l = round(160 + id_eff_h[match(id, rep_ids)] +
      ifelse(treatment == "hypoxia", 0.35, 0.02) * day + rnorm(n(), 0, 7), 1),
    batch = factor(ifelse(id_num %% 2 == 1, "B1", "B2"), levels = c("B1", "B2"))
  ) |>
  select(id, treatment, timepoint, body_mass_g, hemoglobin_g_l, batch)
write_csv(repeated, dat("pika_repeated.csv"), na = "")

# ---------------------------------------------------------------
# 3. pika_survival.csv — 60 ids, 2 treatments, admin censor at 60 d
# ---------------------------------------------------------------
set.seed(20261027 + 2)
surv <- tibble(
  id = sprintf("S%03d", 1:60),
  treatment = factor(rep(c("control", "hypoxia"), 30), levels = c("control", "hypoxia")),
  sex = factor(rep(c("F", "M"), 30), levels = c("F", "M")),
  body_mass_g = round(rnorm(60, 170, 14), 1)
) |>
  mutate(
    time_raw = ifelse(treatment == "control",
      rweibull(n(), shape = 1.5, scale = 60),
      rweibull(n(), shape = 1.5, scale = 32)),
    time_days = pmin(60, pmax(2, round(time_raw, 0))),
    status = as.integer(time_raw <= 60)
  )
# accidental losses before the endpoint → censoring ≥ 20% (docs/05 §5.2)
loss <- c(9, 37, 22, 51)
surv$status[loss] <- 0L
surv <- surv |> select(id, treatment, sex, body_mass_g, time_days, status)
write_csv(surv, dat("pika_survival.csv"), na = "")

# ---------------------------------------------------------------
# 4-6. RNA-seq counts + raw/clean metadata (2000 genes × 12 samples)
# ---------------------------------------------------------------
set.seed(20261027 + 3)
n_genes <- 2000
samples <- c(paste0("C", 1:6), paste0("H", 1:6))
batch_of <- setNames(rep(c("batch1", "batch2"), each = 6), samples)

gene_id <- sprintf("G%05d", 1:n_genes)
gene_name <- paste0("Pk", sprintf("%04d", 1:n_genes))
base_mean <- rgamma(n_genes, shape = 2, scale = 150)
lib_mult <- setNames(rnorm(12, 1, 0.12) |> pmax(0.75), samples)
# batch2 shifts 10% of genes upward (technical, visible in PCA)
batch_genes <- sample(n_genes, 200)
group_mult <- setNames(rep(1, 12), samples)

de_up <- sample(order(base_mean, decreasing = TRUE)[1:300], 40)
de_down <- sample(setdiff(order(base_mean, decreasing = TRUE)[1:300], de_up), 40)
lfc <- setNames(numeric(n_genes), gene_id)
lfc[de_up] <- 1.5     # up in hypoxia
lfc[de_down] <- -1.5  # down in hypoxia

counts <- sapply(samples, function(s) {
  mu <- base_mean * lib_mult[[s]] *
    ifelse(batch_of[[s]] == "batch2" & seq_len(n_genes) %in% batch_genes, 2.2, 1) *
    2^ifelse(grepl("^H", s), lfc, 0)
  rnbinom(n_genes, mu = mu, size = 5)
})
storage.mode(counts) <- "integer"
counts[counts < 0] <- 0L

counts_df <- as_tibble(data.frame(gene_id = gene_id, gene_name = gene_name,
                                  counts, check.names = FALSE, stringsAsFactors = FALSE))
write_csv(counts_df, dat("pika_rnaseq_counts.csv"), na = "")

lib_size <- colSums(counts)
sex_of <- setNames(rep(c("F", "M"), 6), samples)

meta_clean <- tibble(
  sample_id = samples,
  group = factor(ifelse(grepl("^C", samples), "control", "hypoxia"), levels = c("control", "hypoxia")),
  batch = factor(batch_of[samples], levels = c("batch1", "batch2")),
  sex = factor(sex_of[samples], levels = c("F", "M")),
  library_size = as.numeric(lib_size)
)
write_csv(meta_clean, dat("pika_rnaseq_metadata_clean.csv"), na = "")

# raw metadata: 3 planted mismatches vs counts column names (docs/03 §2.3)
raw_ids <- samples
raw_ids[raw_ids == "H5"] <- "H-5"
raw_ids[raw_ids == "H6"] <- "H-6"
raw_ids[raw_ids == "C3"] <- " C3"
meta_raw <- meta_clean |>
  mutate(sample_id = raw_ids) |>
  select(sample_id, group, batch, sex, library_size) |>
  mutate(group = as.character(group), batch = as.character(batch), sex = as.character(sex))
write_csv(meta_raw, dat("pika_rnaseq_metadata_raw.csv"), na = "")

# ---------------------------------------------------------------
# 7. pika_annotation.csv — GO/KEGG pools; hypoxia DE genes share terms
# ---------------------------------------------------------------
set.seed(20261027 + 4)
go_pool <- c("GO:0001666 response to hypoxia", "GO:0071456 cellular response to hypoxia",
  "GO:0006096 glycolytic process", "GO:0006119 oxidative phosphorylation",
  "GO:0006814 sodium ion transport", "GO:0006915 apoptotic process",
  "GO:0008283 cell proliferation", "GO:0010467 gene expression",
  "GO:0006468 protein phosphorylation", "GO:0007165 signal transduction",
  "GO:0006955 immune response", "GO:0055114 oxidation-reduction process")
kegg_pool <- c("ko04066 HIF-1 signaling pathway", "ko04151 PI3K-Akt signaling pathway",
  "ko00190 oxidative phosphorylation", "ko00010 glycolysis / gluconeogenesis",
  "ko04141 protein processing in ER", "ko04145 phagosome",
  "ko04530 tight junction", "ko04610 NF-kappa B signaling pathway")
desc_pool <- c("oxygen-binding protein", "mitochondrial carrier", "glycolytic enzyme",
  "transcription factor", "protein kinase", "ion channel subunit",
  "ribosomal protein", "heat shock protein", "transporter", "enzyme inhibitor",
  "signaling adaptor", "unknown function")

hypoxia_block <- gene_id[de_up[1:24]]  # teach enrichment: shared terms
anno <- tibble(
  gene_id = gene_id,
  symbol = gene_name,
  description = sample(desc_pool, n_genes, replace = TRUE)
) |>
  mutate(
    go_bp = ifelse(gene_id %in% hypoxia_block,
      paste(sample(c("GO:0001666 response to hypoxia", "GO:0071456 cellular response to hypoxia"),
                   n_genes, replace = TRUE),
            sample(go_pool, n_genes, replace = TRUE), sep = ";"),
      paste(sample(go_pool, n_genes, replace = TRUE),
            sample(go_pool, n_genes, replace = TRUE), sep = ";")),
    kegg_pathway = ifelse(gene_id %in% hypoxia_block,
      paste("ko04066 HIF-1 signaling pathway", sample(kegg_pool, n_genes, replace = TRUE), sep = ";"),
      sample(kegg_pool, n_genes, replace = TRUE))
  )
anno$go_bp[anno$gene_id %in% hypoxia_block] <-
  paste0("GO:0001666 response to hypoxia;", anno$go_bp[anno$gene_id %in% hypoxia_block])
anno$kegg_pathway[anno$gene_id %in% hypoxia_block] <-
  paste0("ko04066 HIF-1 signaling pathway;", anno$kegg_pathway[anno$gene_id %in% hypoxia_block])
anno <- anno |> mutate(go_bp = sub("(.*);\\1$", "\\1", go_bp),
                       kegg_pathway = sub("(.*);\\1$", "\\1", kegg_pathway))
write_csv(anno, dat("pika_annotation.csv"), na = "")

# ---------------------------------------------------------------
# 8. plate_reader_raw.csv — 3 leading instrument comment lines
# ---------------------------------------------------------------
set.seed(20261027 + 5)
wells <- paste0(rep(LETTERS[1:8], each = 12), sprintf("%02d", rep(1:12, 8)))
plate <- tibble(
  well = wells,
  od600 = round(pmin(1.6, pmax(0.02, cumsum(rnorm(96, 0.05, 0.03)) + 0.05)), 3),
  temperature_c = round(37 + rnorm(96, 0, 0.25), 2),
  cycle = rep(1, 96)
)
plate_lines <- c(
  "# Plate reader export - BioSim xMark (simulated teaching data)",
  "# Run 2026-04-18 09:30 | mode: OD600 endpoint | 96-well plate",
  "# NOTE: do not edit; import with readr::read_csv(skip = 3)"
)
tmp_plate <- tempfile(fileext = ".csv")
write_csv(plate, tmp_plate, na = "")
write_lines(c(plate_lines, bioR_read_lines(tmp_plate)), dat("plate_reader_raw.csv"))
unlink(tmp_plate)

# ---------------------------------------------------------------
# 9. pika_lab_notebook.xlsx — 2 sheets (samples + incidents)
# ---------------------------------------------------------------
notebook <- list(
  samples = tibble(
    id = phys$id,
    sampled_on = phys$measured_on - 1,
    weighed_by = sample(c("Zhang", "Li", "Wang"), 60, replace = TRUE),
    note = ""
  ),
  incidents = tibble(
    id = c("P017", "P042", "P023", "P048", "P005"),
    incident = c("hemolysis - hemoglobin unreadable (NA)",
                 "hemolysis - hemoglobin unreadable (NA)",
                 "possible double counting - mass unusually high",
                 "juvenile - mass unusually low",
                 "reagent batch changed mid-run"),
    date = as.Date(c("2026-05-08", "2026-05-22", "2026-05-15", "2026-05-29", "2026-05-03"))
  )
)
notebook$samples$note[notebook$samples$id == "P017"] <- "hemolysis"
notebook$samples$note[notebook$samples$id == "P042"] <- "hemolysis"
write_xlsx(notebook, dat("pika_lab_notebook.xlsx"))

# ---------------------------------------------------------------
# 10. data-dictionary.csv + data-manifest.json
# ---------------------------------------------------------------
dict <- tribble(
  ~file, ~variable, ~type, ~unit, ~n_missing, ~allowed_range, ~description,
  "pika_physiology.csv", "id", "chr", "—", 0, "P001–P060", "individual id; one row = one individual",
  "pika_physiology.csv", "altitude_m", "dbl", "m", 0, "3200/4100/5000", "sampling-site altitude",
  "pika_physiology.csv", "altitude_group", "fct", "—", 0, "low<mid<high", "ordered altitude factor",
  "pika_physiology.csv", "sex", "fct", "—", 0, "F,M", "sex",
  "pika_physiology.csv", "body_mass_g", "dbl", "g", 0, "110–240", "body mass; 2 planted extremes (P023, P048)",
  "pika_physiology.csv", "body_length_mm", "dbl", "mm", 0, "145–235", "body length",
  "pika_physiology.csv", "hemoglobin_g_l", "dbl", "g/L", 2, "100–260", "hemoglobin; right-skewed; NA = hemolysis",
  "pika_physiology.csv", "hematocrit_pct", "dbl", "%", 0, "30–65", "hematocrit",
  "pika_physiology.csv", "glucose_mmol_l", "dbl", "mmol/L", 0, "3–13", "blood glucose",
  "pika_physiology.csv", "batch", "fct", "—", 0, "B1–B3", "measurement batch",
  "pika_physiology.csv", "measured_on", "date", "—", 0, "2026-05", "measurement date",
  "pika_repeated.csv", "id", "chr", "—", 0, "R01–R12", "individual id; 3 visits each",
  "pika_repeated.csv", "treatment", "fct", "—", 0, "control/hypoxia", "treatment arm",
  "pika_repeated.csv", "timepoint", "fct", "—", 0, "T0/T14/T28", "visit (days)",
  "pika_repeated.csv", "body_mass_g", "dbl", "g", 0, "120–220", "mass; ICC ≈ 0.5 by design",
  "pika_repeated.csv", "hemoglobin_g_l", "dbl", "g/L", 0, "115–235", "hemoglobin",
  "pika_repeated.csv", "batch", "fct", "—", 0, "B1/B2", "measurement batch",
  "pika_survival.csv", "id", "chr", "—", 0, "S001–S060", "individual id",
  "pika_survival.csv", "treatment", "fct", "—", 0, "control/hypoxia", "treatment arm",
  "pika_survival.csv", "sex", "fct", "—", 0, "F/M", "sex",
  "pika_survival.csv", "body_mass_g", "dbl", "g", 0, "120–220", "baseline mass",
  "pika_survival.csv", "time_days", "dbl", "days", 0, "> 0, ≤ 60", "event time or censoring time",
  "pika_survival.csv", "status", "int", "—", 0, "0 = censored, 1 = died", "event indicator",
  "pika_rnaseq_counts.csv", "gene_id", "chr", "—", 0, "G00001–G02000", "gene id (join key)",
  "pika_rnaseq_counts.csv", "gene_name", "chr", "—", 0, "Pk0001–Pk2000", "gene symbol",
  "pika_rnaseq_counts.csv", "C1–C6 / H1–H6", "int", "counts", 0, "≥ 0 integers", "raw counts; 80 true DE genes; batch2 shifts 200 genes",
  "pika_rnaseq_metadata_raw.csv", "sample_id", "chr", "—", 0, "C1…H6 (+3 planted mismatches)", "raw sample ids: H-5, H-6, ' C3' are broken",
  "pika_rnaseq_metadata_raw.csv", "group", "chr", "—", 0, "control/hypoxia", "group",
  "pika_rnaseq_metadata_raw.csv", "batch", "chr", "—", 0, "batch1/batch2", "sequencing batch",
  "pika_rnaseq_metadata_raw.csv", "sex", "chr", "—", 0, "F/M", "sex",
  "pika_rnaseq_metadata_raw.csv", "library_size", "dbl", "reads", 0, "> 0", "column sums of counts",
  "pika_rnaseq_metadata_clean.csv", "sample_id", "chr", "—", 0, "C1…H6", "clean ids matching counts columns",
  "pika_rnaseq_metadata_clean.csv", "group", "fct", "—", 0, "control/hypoxia", "group",
  "pika_rnaseq_metadata_clean.csv", "batch", "fct", "—", 0, "batch1/batch2", "sequencing batch",
  "pika_rnaseq_metadata_clean.csv", "sex", "fct", "—", 0, "F/M", "sex",
  "pika_rnaseq_metadata_clean.csv", "library_size", "dbl", "reads", 0, "> 0", "column sums of counts",
  "pika_annotation.csv", "gene_id", "chr", "—", 0, "G00001–G02000", "gene id",
  "pika_annotation.csv", "symbol", "chr", "—", 0, "Pk0001–Pk2000", "gene symbol",
  "pika_annotation.csv", "description", "chr", "—", 0, "text", "one-line function (simulated)",
  "pika_annotation.csv", "go_bp", "chr", "—", 0, "GO ids;…", "GO biological process terms",
  "pika_annotation.csv", "kegg_pathway", "chr", "—", 0, "ko ids;…", "KEGG pathways",
  "plate_reader_raw.csv", "(3 leading comment lines)", "—", "—", 0, "skip = 3", "instrument header comments",
  "plate_reader_raw.csv", "well", "chr", "—", 0, "A01–H12", "well position",
  "plate_reader_raw.csv", "od600", "dbl", "OD", 0, "0.02–1.6", "OD600 reading",
  "plate_reader_raw.csv", "temperature_c", "dbl", "°C", 0, "36–38", "plate temperature",
  "plate_reader_raw.csv", "cycle", "int", "—", 0, "1", "kinetic cycle index",
  "pika_lab_notebook.xlsx", "sheet: samples", "sheet", "—", 0, "60 rows", "id, sampled_on, weighed_by, note",
  "pika_lab_notebook.xlsx", "sheet: incidents", "sheet", "—", 0, "5 rows", "explains the 2 hemoglobin NAs and 2 mass extremes"
)
write_csv(dict, dat("data-dictionary.csv"), na = "")

files_spec <- list(
  list(file = "pika_physiology.csv", description = "pika physiology survey (simulated)",
       chapters = c("ch03", "ch06", "ch08", "ch10", "ch11", "ch12", "ch13")),
  list(file = "pika_repeated.csv", description = "repeated measures, 12 ids × 3 visits (simulated)",
       chapters = c("ch11", "ch15")),
  list(file = "pika_survival.csv", description = "survival experiment with censoring (simulated)",
       chapters = c("ch13", "ch16")),
  list(file = "pika_rnaseq_counts.csv", description = "RNA-seq raw counts 2000 × 12 (simulated)",
       chapters = c("ch07", "ch17", "ch18")),
  list(file = "pika_rnaseq_metadata_raw.csv", description = "RNA-seq sample sheet, raw ids (simulated)",
       chapters = c("ch04", "ch07")),
  list(file = "pika_rnaseq_metadata_clean.csv", description = "RNA-seq sample sheet, clean ids (simulated)",
       chapters = c("ch17", "ch18")),
  list(file = "pika_annotation.csv", description = "gene annotation with GO/KEGG (simulated)",
       chapters = c("ch18")),
  list(file = "plate_reader_raw.csv", description = "plate reader export with 3 comment lines (simulated)",
       chapters = c("ch04")),
  list(file = "pika_lab_notebook.xlsx", description = "lab notebook, 2 sheets (simulated)",
       chapters = c("ch04")),
  list(file = "data-dictionary.csv", description = "data dictionary for all teaching files",
       chapters = c("all"))
)

manifest <- list(
  generated = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
  seed = 20261027,
  files = lapply(files_spec, function(s) {
    p <- dat(s$file)
    rows <- if (grepl("\\.xlsx$", s$file)) {
      "2 sheets"
    } else {
      n <- length(bioR_read_lines(p))
      if (s$file == "plate_reader_raw.csv") n <- n - 3 - 1  # comments + header
      else n <- n - 1
      n
    }
    cols <- if (grepl("\\.xlsx$", s$file)) "2 sheets" else
      length(strsplit(bioR_read_lines(p)[if (s$file == "plate_reader_raw.csv") 4 else 1], ",")[[1]])
    list(
      file = s$file, rows = rows, cols = cols, simulated = TRUE,
      sha256 = digest(p, algo = "sha256", file = TRUE),
      description = s$description, chapters = s$chapters
    )
  })
)
write(toJSON(manifest, pretty = TRUE, auto_unbox = TRUE), dat("data-manifest.json"))

cat("generate-data.R: wrote", length(files_spec), "files + dictionary + manifest\n")
