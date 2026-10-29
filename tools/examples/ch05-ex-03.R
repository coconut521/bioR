set.seed(20261027)
n_draw <- 10
sim <- replicate(1000, {
  s <- rnorm(n_draw, 155, 12)
  c(mean = mean(s), sd = sd(s))
})
sim_m <- t(sim)
means <- sim_m[, "mean"]
c(mean_of_means = round(mean(means), 1),
  se_of_means   = round(sd(means), 1))
round(12 / sqrt(n_draw), 2)
