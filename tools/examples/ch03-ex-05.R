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
