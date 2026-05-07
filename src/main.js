   // ==================== CONFIGURACIÓN DE TIPOS DE HORA ====================
        const tiposHora = {
            'hed': { nombre: 'Hora Extra Diurna', factor: 1.25, esRecargoNeto: false, emoji: '☀️' },
            'hen': { nombre: 'Hora Extra Nocturna', factor: 1.75, esRecargoNeto: false, emoji: '🌙' },
            'rno': { nombre: 'Recargo Nocturno Ordinario', factor: 0.35, esRecargoNeto: true, emoji: '🌆' },
            'dfd': { nombre: 'Dominical/Festiva Diurna', factor: 1.75, esRecargoNeto: false, emoji: '📅' },
            'dfn': { nombre: 'Dominical/Festiva Nocturna', factor: 2.10, esRecargoNeto: false, emoji: '📅🌙' },
            'edfd': { nombre: 'Extra Dominical Diurna', factor: 2.00, esRecargoNeto: false, emoji: '⭐' },
            'edfn': { nombre: 'Extra Dominical Nocturna', factor: 2.50, esRecargoNeto: false, emoji: '⭐🌙' }
        };

        // ==================== FUNCIONES AUXILIARES ====================
        function obtenerSalario() {
            const val = parseFloat(document.getElementById('salario').value);
            return (isNaN(val) || val <= 0) ? 0 : val;
        }

        function obtenerHorasDiarias() {
            const val = parseFloat(document.getElementById('horasDiarias').value);
            return (isNaN(val) || val <= 0) ? 8 : val;
        }

        function calcularValorHoraOrdinaria() {
            const salario = obtenerSalario();
            const horasDiarias = obtenerHorasDiarias();
            if (salario <= 0 || horasDiarias <= 0) return 0;
            return salario / 30 / horasDiarias;
        }

        function obtenerHorasTipo(tipo) {
            const input = document.getElementById('horas-' + tipo);
            if (!input) return 0;
            const val = parseFloat(input.value);
            return (isNaN(val) || val < 0) ? 0 : val;
        }

        function formatearPesos(valor) {
            return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(valor);
        }

        function formatearPesosDecimal(valor) {
            return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(valor);
        }

        // ==================== CÁLCULO PRINCIPAL ====================
        function calcularTodo() {
            const valorHora = calcularValorHoraOrdinaria();
            const salario = obtenerSalario();
            const horasDiarias = obtenerHorasDiarias();

            // Actualizar display del valor hora ordinaria
            const displayValorHora = document.getElementById('valorHoraDisplay');
            if (salario > 0 && horasDiarias > 0 && valorHora > 0) {
                displayValorHora.textContent = formatearPesos(valorHora);
                displayValorHora.classList.remove('text-muted');
                displayValorHora.classList.add('text-dark');
            } else {
                displayValorHora.textContent = '—';
                displayValorHora.classList.add('text-muted');
            }
            // Info extra
            const infoExtra = document.querySelector('.alert-info small');
            if (infoExtra && salario > 0 && horasDiarias > 0) {
                infoExtra.textContent = `Salario ÷ 30 ÷ ${horasDiarias} hrs/día · Jornada semanal: ~${(horasDiarias * 6).toFixed(1)} hrs`;
            }

            // Recolectar datos
            const filasData = [];
            let totalAdicional = 0;
            let hayDatos = false;

            for (const [tipo, config] of Object.entries(tiposHora)) {
                const cantidad = obtenerHorasTipo(tipo);
                const resultadoDiv = document.getElementById('resultado-' + tipo);
                const card = document.querySelector(`[data-tipo="${tipo}"] .card`);

                if (cantidad > 0 && valorHora > 0) {
                    hayDatos = true;
                    const valorUnitario = valorHora * config.factor;
                    const subtotal = valorUnitario * cantidad;
                    const recargoNeto = subtotal; // Todo el subtotal es adicional
                    totalAdicional += recargoNeto;

                    if (resultadoDiv) {
                        resultadoDiv.innerHTML = `<span class="fw-semibold">${formatearPesos(subtotal)}</span> <small class="text-muted">(${formatearPesos(valorUnitario)} c/u)</small>`;
                        resultadoDiv.classList.remove('d-none');
                    }
                    // Indicar activo
                    if (card) card.classList.add('shadow-sm');

                    filasData.push({
                        tipo, nombre: config.nombre, emoji: config.emoji,
                        cantidad, valorUnitario, subtotal, recargoNeto,
                        factor: config.factor, esRecargoNeto: config.esRecargoNeto
                    });
                } else {
                    if (resultadoDiv) {
                        resultadoDiv.innerHTML = '';
                        resultadoDiv.classList.add('d-none');
                    }
                    if (card) card.classList.remove('shadow-sm');
                }
            }

            actualizarTablaResumen(filasData, totalAdicional, hayDatos, valorHora);

            // Total destacado
            const totalCifra = document.getElementById('totalCifra');
            if (hayDatos && totalAdicional > 0) {
                totalCifra.textContent = formatearPesos(totalAdicional);
            } else {
                totalCifra.textContent = '$ 0';
            }
        }

        // ==================== ACTUALIZAR TABLA ====================
        function actualizarTablaResumen(filasData, totalAdicional, hayDatos, valorHora) {
            const tbody = document.getElementById('tbodyResumen');
            const tfoot = document.getElementById('tfootResumen');
            tbody.innerHTML = '';
            tfoot.innerHTML = '';

            if (!hayDatos || valorHora <= 0) {
                tbody.innerHTML = '<tr id="filaSinDatos"><td colspan="5" class="text-center text-muted py-4">📭 Ingrese horas en alguna categoría para ver la liquidación</td></tr>';
                return;
            }

            filasData.forEach(fila => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${fila.emoji} ${fila.nombre} <small class="text-muted">(×${fila.factor.toFixed(2)})</small></td>
                    <td>${fila.cantidad.toFixed(1)} h</td>
                    <td>${formatearPesosDecimal(fila.valorUnitario)}</td>
                    <td class="fw-semibold">${formatearPesos(fila.subtotal)}</td>
                    <td class="fw-bold text-primary">${formatearPesos(fila.recargoNeto)}</td>
                `;
                tbody.appendChild(tr);
            });

            const trTotal = document.createElement('tr');
            trTotal.classList.add('table-active', 'fw-bold');
            trTotal.innerHTML = `
                <td colspan="4" class="text-end">🧾 TOTAL ADICIONAL A PAGAR</td>
                <td class="fs-5">${formatearPesos(totalAdicional)}</td>
            `;
            tfoot.appendChild(trTotal);
        }

        // ==================== AJUSTAR HORAS (BOTONES +/-) ====================
        function ajustarHoras(tipo, delta) {
            const input = document.getElementById('horas-' + tipo);
            if (!input) return;
            let val = parseFloat(input.value);
            if (isNaN(val) || val < 0) val = 0;
            val = Math.max(0, val + delta);
            val = Math.round(val * 2) / 2; // redondear a 0.5
            input.value = val;
            calcularTodo();
            input.focus();
            input.select();
        }

        // ==================== LIMPIAR TODO ====================
        function limpiarTodo() {
            for (const tipo of Object.keys(tiposHora)) {
                const input = document.getElementById('horas-' + tipo);
                if (input) input.value = '0';
                const resultadoDiv = document.getElementById('resultado-' + tipo);
                if (resultadoDiv) {
                    resultadoDiv.innerHTML = '';
                    resultadoDiv.classList.add('d-none');
                }
                const card = document.querySelector(`[data-tipo="${tipo}"] .card`);
                if (card) card.classList.remove('shadow-sm');
            }
            document.getElementById('salario').value = '1600000';
            document.getElementById('horasDiarias').value = '8';
            calcularTodo();
            document.getElementById('card-config').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // ==================== EVENTOS INICIALES ====================
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('salario').addEventListener('input', calcularTodo);
            document.getElementById('salario').addEventListener('change', calcularTodo);
            document.getElementById('horasDiarias').addEventListener('input', calcularTodo);
            document.getElementById('horasDiarias').addEventListener('change', calcularTodo);

            for (const tipo of Object.keys(tiposHora)) {
                const input = document.getElementById('horas-' + tipo);
                if (input) {
                    input.addEventListener('input', calcularTodo);
                    input.addEventListener('change', calcularTodo);
                    // Rueda del ratón y flechas
                    input.addEventListener('wheel', (e) => {
                        if (document.activeElement === input) {
                            e.preventDefault();
                            ajustarHoras(tipo, e.deltaY > 0 ? -0.5 : 0.5);
                        }
                    }, { passive: false });
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowUp') { e.preventDefault(); ajustarHoras(tipo, 0.5); }
                        else if (e.key === 'ArrowDown') { e.preventDefault(); ajustarHoras(tipo, -0.5); }
                    });
                }
            }

            calcularTodo();
            setTimeout(() => {
                document.getElementById('salario').focus();
                document.getElementById('salario').select();
            }, 300);
        });