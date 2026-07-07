-- GeoópS · LIMPEZA do seed de teste — deixa o banco pronto para os DADOS REAIS.
-- Remove o estado operacional de teste e os RDOs replicados pelo seed.
-- Tabelas de governança (usuarios, logins, diretrizes, procedimentos) NÃO são tocadas.

begin;
delete from estado_operacional where id = 'principal' and atualizado_por = 'seed-teste';
delete from rdo_log where id like 'rdoseed_%';
commit;
