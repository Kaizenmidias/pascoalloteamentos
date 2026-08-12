<?php

namespace App\Import\WordPress;

use LogicException;

class DomainImportRunner
{
    public function preview(LegacyEntity $entity): array
    {
        if (! in_array($entity, [LegacyEntity::Property, LegacyEntity::Condominium, LegacyEntity::Subdivision], true)) {
            throw new LogicException('Somente os três domínios imobiliários são aceitos.');
        }

return ['entity' => $entity->value, 'mode' => 'dry-run', 'writes' => 0, 'message' => 'Infraestrutura pronta; o mapper de dados será implementado e validado antes da importação de produção.'];
    }
}
