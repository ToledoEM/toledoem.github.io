# MSigDF: Molecular Signature Database (MSigDB) in a Data Frame

Abstract

This data package contains the Molecular Signature Database (MSigDB) for
both human and predicted mouse orthologs in separate data frames
(tibbles). Each data frame (`msigdf.human` and `msigdf.mouse`) contain
three columns: the collection (Hallmark, or c1-c8), the gene set, and
Entrez IDs for genes in that set. The `msigdf.urls` tibble contains
links to descriptions on the Broad Institute’s website of each gene set.
**[Source code available on
GitHub](https://github.com/ToledoEM/msigdf)**.

## Data sources

Original data from the Broad Institute’s Molecular Signature Database
(MSigDB)[^1], redistributed as separate gmt data files from the MSigDB.

------------------------------------------------------------------------

*The gene sets contained in the MSigDB are from a wide variety of
sources, and relate to a variety of species, mostly human. To facilitate
use of the MSigDB in our work, we have created a pure mouse version of
the MSigDB by mapping all sets to mouse orthologs. A pure human version
is also provided.*

***Procedure:***

*1. The current MSigDB v2025.1 gmt files were downloaded from Broad
ftp.*  
*2. This was done with the human and mouse gene sets*  
*3. Each collection was converted to a list in R, and written to a RData
file using [`save()`](https://rdrr.io/r/base/save.html).*

------------------------------------------------------------------------

See the script in `data-raw/` to see how the data frames (tibbles) were
created.

## Example usage

There are three data frames (tibbles) this package. The `msigdf.human`
data frame has columns for each MSigDB collection divided by
sub-collection (like cc, bp and mf for C5). The format of the data is
tidy, so each row is a single gene set collection, sub-collection and
gene symbol. The `msigdf.mouse` data frame has the same structure for
mouse orthologs. The `msigdf.urls` data frame links the name of the gene
set to the URL on the Broad’s website.

New C5 ontology information was added to the category subcode for easy
filtering and consistency.

- HPO: Human Phenotype Ontology
- MF: GO Molecular Function ontology
- BP: GO Biological Process ontology
- CC: GO Cellular Component ontology

The data sets in this package have several million rows. The package
imports the tibble package so they’re displayed nicely.

``` r
library(tidyverse)
library(msigdf)
```

Take a look:

``` r
msigdf.human %>% head()
```

    ## # A tibble: 6 × 4
    ##   category_code category_subcode geneset symbol 
    ##   <chr>         <chr>            <chr>   <chr>  
    ## 1 c1            all              MT      MT-ATP6
    ## 2 c1            all              MT      MT-ATP8
    ## 3 c1            all              MT      MT-CO1 
    ## 4 c1            all              MT      MT-CO2 
    ## 5 c1            all              MT      MT-CO3 
    ## 6 c1            all              MT      MT-CYB

``` r
msigdf.mouse %>% head()
```

    ## # A tibble: 6 × 4
    ##   category_code category_subcode geneset symbol 
    ##   <chr>         <chr>            <chr>   <chr>  
    ## 1 m1            all              MT      mt-Atp6
    ## 2 m1            all              MT      mt-Atp8
    ## 3 m1            all              MT      mt-Co1 
    ## 4 m1            all              MT      mt-Co2 
    ## 5 m1            all              MT      mt-Co3 
    ## 6 m1            all              MT      mt-Cytb

``` r
msigdf.urls %>% as.data.frame() %>% head()
```

    ##   category_code category_subcode  geneset
    ## 1            c1              all       MT
    ## 2            c1              all chr10p11
    ## 3            c1              all chr10p12
    ## 4            c1              all chr10p13
    ## 5            c1              all chr10p14
    ## 6            c1              all chr10p15
    ##                                                             url
    ## 1       http://software.broadinstitute.org/gsea/msigdb/cards/MT
    ## 2 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p11
    ## 3 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p12
    ## 4 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p13
    ## 5 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p14
    ## 6 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p15

Just get the entries for the [KEGG non-homologous end joining
pathway](http://www.genome.jp/kegg/pathway/hsa/hsa03450.md):

``` r
msigdf.human %>% 
  filter(geneset=="KEGG_NON_HOMOLOGOUS_END_JOINING")
```

    ## # A tibble: 13 × 4
    ##    category_code category_subcode geneset                         symbol 
    ##    <chr>         <chr>            <chr>                           <chr>  
    ##  1 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING DCLRE1C
    ##  2 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING DNTT   
    ##  3 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING FEN1   
    ##  4 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING LIG4   
    ##  5 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING MRE11  
    ##  6 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING NHEJ1  
    ##  7 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING POLL   
    ##  8 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING POLM   
    ##  9 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING PRKDC  
    ## 10 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING RAD50  
    ## 11 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING XRCC4  
    ## 12 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING XRCC5  
    ## 13 c2            all              KEGG_NON_HOMOLOGOUS_END_JOINING XRCC6

Some software, e.g., [fGSEA](https://github.com/ctlab/fgsea) might
require gene sets to be a named list of genes identifiers, where the
name of each element in the list is the name of the pathway. This is how
the data was originally structured, and we can return to it with
[`plyr::dlply()`](https://rdrr.io/pkg/plyr/man/dlply.html). Here, let’s
use only the hallmark sets, and after we `dlply` the data into this
named list format, get just the first few pathways, and in each of
those, just display the first few gene symbols.

``` r
msigdf.human %>% 
  filter(category_code=="c2") %>% 
  select(geneset, symbol) %>% 
  group_by(geneset) %>% 
  summarize(symbol=list(symbol)) %>% 
  deframe() %>% 
  head() %>% 
  map(head)
```

    ## $ABBUD_LIF_SIGNALING_1_DN
    ## [1] "AHNAK"    "ALCAM"    "ANKRD40"  "ARID1A"   "BCKDHB"   "C16orf89"
    ## 
    ## $ABBUD_LIF_SIGNALING_1_UP
    ## [1] "ACAA2"   "ALDOC"   "ANXA8L1" "BCL3"    "CEBPB"   "CXCL14" 
    ## 
    ## $ABBUD_LIF_SIGNALING_2_DN
    ## [1] "CGA"    "CITED2" "NALCN"  "PITX2"  "PTHLH"  "SCN1A" 
    ## 
    ## $ABBUD_LIF_SIGNALING_2_UP
    ## [1] "ATP1B1"  "COL11A1" "DAB2"    "DCN"     "DIO2"    "EZR"    
    ## 
    ## $ABDELMOHSEN_ELAVL4_TARGETS
    ## [1] "BCL2"  "CAB39" "CASP3" "CDC42" "CDH2"  "DLG4" 
    ## 
    ## $ABDULRAHMAN_KIDNEY_CANCER_VHL_DN
    ## [1] "ACTA2"   "ALDH1A1" "ALDH3B1" "ITGB3BP" "MPPE1"   "MTMR3"

## Further exploration

The number of gene sets in each collection for each organism is
dependent of the construction at MSigDB.

**Human Collection of gene sets**
<https://www.gsea-msigdb.org/gsea/msigdb/human/collections.jsp>

``` r
msigdf.human %>%
  group_by(category_code,category_subcode) %>% 
  tally()
```

    ## # A tibble: 16 × 3
    ## # Groups:   category_code [16]
    ##    category_code category_subcode       n
    ##    <chr>         <chr>              <int>
    ##  1 c1            all                43429
    ##  2 c2            all               581467
    ##  3 c3            all               818674
    ##  4 c4            all                98548
    ##  5 c5            all              1361645
    ##  6 c6            all                30586
    ##  7 c7            all               990349
    ##  8 c8            all               157386
    ##  9 h             all                 7322
    ## 10 m1            all                41375
    ## 11 m2            all               197902
    ## 12 m3            all               396685
    ## 13 m5            all               885544
    ## 14 m7            all                70547
    ## 15 m8            all                47967
    ## 16 mh            all                 7191

**Mouse Collection of gene sets**
<https://www.gsea-msigdb.org/gsea/msigdb/mouse/collections.jsp>

``` r
msigdf.mouse %>%
  group_by(category_code,category_subcode) %>% 
  tally()
```

    ## # A tibble: 7 × 3
    ## # Groups:   category_code [7]
    ##   category_code category_subcode      n
    ##   <chr>         <chr>             <int>
    ## 1 m1            all               41375
    ## 2 m2            all              197902
    ## 3 m3            all              396685
    ## 4 m5            all              885544
    ## 5 m7            all               70547
    ## 6 m8            all               47967
    ## 7 mh            all                7191

Get the URL for the hallmark set with the fewest number of genes (Notch
signaling). Optionally, `%>%` this to `browseURL` to open it up in your
browser.

``` r
msigdf.human %>%
  filter(category_code=="h") %>%
  count(geneset) %>%
  arrange(n) %>%
  head(1) %>%
  inner_join(msigdf.urls, by="geneset") %>%
  pull(url)
```

    ## [1] "http://software.broadinstitute.org/gsea/msigdb/cards/HALLMARK_NOTCH_SIGNALING"
    ## [2] "http://software.broadinstitute.org/gsea/msigdb/cards/HALLMARK_NOTCH_SIGNALING"

Just look at the number of genes in each KEGG pathway (sorted descending
by the number of genes in that pathway):

``` r
msigdf.human %>%
  filter(category_code=="c2" & grepl("^KEGG_", geneset)) %>%
  count(geneset) %>% 
  arrange(desc(n))
```

    ## # A tibble: 844 × 2
    ##    geneset                                          n
    ##    <chr>                                        <int>
    ##  1 KEGG_OLFACTORY_TRANSDUCTION                    389
    ##  2 KEGG_PATHWAYS_IN_CANCER                        325
    ##  3 KEGG_NEUROACTIVE_LIGAND_RECEPTOR_INTERACTION   272
    ##  4 KEGG_MAPK_SIGNALING_PATHWAY                    267
    ##  5 KEGG_CYTOKINE_CYTOKINE_RECEPTOR_INTERACTION    264
    ##  6 KEGG_REGULATION_OF_ACTIN_CYTOSKELETON          213
    ##  7 KEGG_FOCAL_ADHESION                            199
    ##  8 KEGG_CHEMOKINE_SIGNALING_PATHWAY               188
    ##  9 KEGG_HUNTINGTONS_DISEASE                       183
    ## 10 KEGG_ENDOCYTOSIS                               181
    ## # ℹ 834 more rows

## Session info

    ## R version 4.5.1 (2025-06-13)
    ## Platform: aarch64-apple-darwin20
    ## Running under: macOS Tahoe 26.1
    ## 
    ## Matrix products: default
    ## BLAS:   /Library/Frameworks/R.framework/Versions/4.5-arm64/Resources/lib/libRblas.0.dylib 
    ## LAPACK: /Library/Frameworks/R.framework/Versions/4.5-arm64/Resources/lib/libRlapack.dylib;  LAPACK version 3.12.1
    ## 
    ## locale:
    ## [1] en_US.UTF-8/en_US.UTF-8/en_US.UTF-8/C/en_US.UTF-8/en_US.UTF-8
    ## 
    ## time zone: Europe/London
    ## tzcode source: internal
    ## 
    ## attached base packages:
    ## [1] stats     graphics  grDevices utils     datasets  methods   base     
    ## 
    ## other attached packages:
    ##  [1] msigdf_2025.1    lubridate_1.9.4  forcats_1.0.1    stringr_1.6.0   
    ##  [5] dplyr_1.1.4      purrr_1.2.0      readr_2.1.5      tidyr_1.3.1     
    ##  [9] tibble_3.3.0     ggplot2_4.0.0    tidyverse_2.0.0  knitr_1.50      
    ## [13] BiocStyle_2.36.0
    ## 
    ## loaded via a namespace (and not attached):
    ##  [1] utf8_1.2.6          sass_0.4.10         generics_0.1.4     
    ##  [4] stringi_1.8.7       hms_1.1.4           digest_0.6.37      
    ##  [7] magrittr_2.0.4      evaluate_1.0.5      grid_4.5.1         
    ## [10] timechange_0.3.0    RColorBrewer_1.1-3  bookdown_0.45      
    ## [13] fastmap_1.2.0       jsonlite_2.0.0      BiocManager_1.30.26
    ## [16] scales_1.4.0        textshaping_1.0.4   jquerylib_0.1.4    
    ## [19] cli_3.6.5           rlang_1.1.6         withr_3.0.2        
    ## [22] cachem_1.1.0        yaml_2.3.10         tools_4.5.1        
    ## [25] tzdb_0.5.0          vctrs_0.6.5         R6_2.6.1           
    ## [28] lifecycle_1.0.4     fs_1.6.6            htmlwidgets_1.6.4  
    ## [31] ragg_1.5.0          pkgconfig_2.0.3     desc_1.4.3         
    ## [34] pkgdown_2.2.0       pillar_1.11.1       bslib_0.9.0        
    ## [37] gtable_0.3.6        glue_1.8.0          systemfonts_1.3.1  
    ## [40] xfun_0.54           tidyselect_1.2.1    rstudioapi_0.17.1  
    ## [43] farver_2.1.2        htmltools_0.5.8.1   rmarkdown_2.30     
    ## [46] compiler_4.5.1      S7_0.2.0

[^1]: <http://www.broad.mit.edu/gsea/msigdb/index.jsp>
