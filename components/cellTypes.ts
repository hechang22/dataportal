const CELL_TYPES = [
    // --- B Cells ---
    { value: 'Naive B cell', label: 'Naive B cell' },
    { value: 'Switched memory B cell', label: 'Switched memory B cell' },
    { value: 'Unswitched memory B cell', label: 'Unswitched memory B cell' },
    { value: 'Double negative B cell', label: 'Double negative B cell' },
    { value: 'Plasmablasts', label: 'Plasmablasts' },
    { value: 'Plasma', label: 'Plasma' },
  
    // --- CD4+ T Cells ---
    { value: 'Naive CD4 cell', label: 'Naive CD4+ T cell' },
    { value: 'Memory CD4 T cell', label: 'Memory CD4+ T cell' },
    { value: 'Th1 cell', label: 'Th1 cell' },
    { value: 'Th2 cell', label: 'Th2 cell' },
    { value: 'Th17 cell', label: 'Th17 cell' },
    { value: 'Tfh cell', label: 'Tfh cell' },
    { value: 'Fr. I nTreg cell', label: 'nTreg cell (Fr. I)' },
    { value: 'Fr. II nTreg cell', label: 'nTreg cell (Fr. II)' },
    { value: 'Fr. III nTreg cell', label: 'nTreg cell (Fr. III)' },
  
    // --- CD8+ T Cells ---
    { value: 'Naive CD8 T cell', label: 'Naive CD8+ T cell' },
    { value: 'Central Memory CD8 T cell', label: 'Central Memory CD8+ T cell' },
    { value: 'Effector Memory CD8 T cell', label: 'Effector Memory CD8+ T cell' },
    { value: 'Resting Memory CD8 T cell', label: 'Resting Memory CD8+ T cell' },
  
    // --- Monocytes & Myeloid ---
    { value: 'CL Monocytes', label: 'CL Monocytes (Classical)' },
    { value: 'Int Monocytes', label: 'Int Monocytes (Intermediate)' },
    { value: 'NC Monocytes', label: 'NC Monocytes (Non-classical)' },
    { value: 'LDG_CD14+', label: 'LDG (CD14+)' },
    { value: 'LDG_CD14-', label: 'LDG (CD14-)' },
    { value: 'Neutrophil', label: 'Neutrophil' },
    { value: 'pDC', label: 'pDC (Plasmacytoid DC)' },
    { value: 'mDC', label: 'mDC (Myeloid DC)' },
  
    // --- Others ---
    { value: 'NK cell', label: 'NK cell' },
    { value: 'Platelet', label: 'Platelet' },
    { value: 'EV', label: 'EV (Extracellular Vesicles)' },
  ];