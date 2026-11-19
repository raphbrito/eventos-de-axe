/* Exportações do painel, com o mesmo contrato de convidados usado no Odún Ìjẹ. */
window.EventExports = (() => {
  const filename = (event, kind) => `${event.slug}-${kind}-${new Date().toISOString().slice(0, 10)}`;
  const confirmed = guests => guests.filter(guest => guest.confirmado === true);
  const summary = guests => {
    const yes = confirmed(guests), companions = yes.reduce((total, guest) => total + Number(guest.acompanhantes || 0), 0);
    return { responses: guests.length, confirmed: yes.length, declined: guests.filter(guest => guest.confirmado === false).length, companions, people: yes.length + companions };
  };
  function exportExcel(event, guests) {
    if (!window.XLSX) throw new Error("Biblioteca de planilha indisponível.");
    const rows = guests.map(guest => ({ Convidado: guest.nome || "", Resposta: guest.confirmado === true ? "Confirmado" : guest.confirmado === false ? "Recusou" : "", Acompanhantes: Number(guest.acompanhantes || 0), "Data da resposta": guest.dataResposta || "" }));
    const sheet = XLSX.utils.json_to_sheet(rows), book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Respostas"); XLSX.writeFile(book, `${filename(event, "respostas")}.xlsx`);
  }
  function exportPdf(event, guests, receptionOnly = false) {
    if (!window.jspdf?.jsPDF) throw new Error("Biblioteca de PDF indisponível.");
    const doc = new window.jspdf.jsPDF(), info = summary(guests), list = receptionOnly ? confirmed(guests) : guests;
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(receptionOnly ? "Lista de recepção" : "Lista de respostas", 15, 20);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(event.nome, 15, 28);
    doc.text(`Respostas: ${info.responses} | Confirmados: ${info.confirmed} | Recusas: ${info.declined} | Acompanhantes: ${info.companions} | Pessoas previstas: ${info.people}`, 15, 36, { maxWidth: 180 });
    doc.autoTable({ startY: 46, head: [receptionOnly ? ["Convidado", "Acompanhantes", "Check-in"] : ["Convidado", "Resposta", "Acompanhantes", "Recebida em"]], body: receptionOnly ? list.map(guest => [guest.nome || "-", Number(guest.acompanhantes || 0), ""]) : list.map(guest => [guest.nome || "-", guest.confirmado === true ? "Confirmado" : guest.confirmado === false ? "Recusou" : "-", Number(guest.acompanhantes || 0), guest.dataResposta || "-"]) });
    doc.save(`${filename(event, receptionOnly ? "recepcao" : "respostas")}.pdf`);
  }
  return { exportExcel, exportPdf };
})();
