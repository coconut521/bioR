# ============================================================
# bioR · 数据框与 tidy 数据：一张表就是一次实验
# All example code for ch03, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch03-ex-01.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
glimpse(pika[, c("id", "altitude_group", "sex", "body_mass_g")])

# ---- ch03-ex-02.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika$body_mass_g[1]
pika[1, ]
pika[pika$sex == "F", "body_mass_g"]

# ---- ch03-ex-03.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
dup_id <- pika$id[duplicated(pika$id)]
length(dup_id)
pika |> distinct(id) |> nrow()

# ---- ch03-ex-04.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika_tidy <- pika |>
  mutate(altitude_group = factor(altitude_group,
    levels = c("low", "mid", "high"), ordered = TRUE))
levels(pika_tidy$altitude_group)
table(pika_tidy$altitude_group)

# ---- ch03-ex-05.R ----
library(readr); library(dplyr)
dict <- tribble(
  ~variable,         ~type,  ~unit,  ~missing, ~allowed_range, ~description,
  "id",              "chr",  "-",    0,        "P001-P060",    "individual id; one row = one individual",
  "altitude_group",  "fct",  "-",    0,        "low<mid<high", "ordered altitude factor",
  "sex",             "fct",  "-",    0,        "F, M",         "sex",
  "body_mass_g",     "dbl",  "g",    0,        "110-240",      "body mass",
  "hemoglobin_g_l",  "dbl",  "g/L",  2,        "100-260",      "hemoglobin; NA = hemolysis"
)
dict
