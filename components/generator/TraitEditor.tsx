'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Edit2, Save, Trash2 } from 'lucide-react';
import type { LayerElement } from '@/lib/engine/types';

interface TraitEditorProps {
  elements: LayerElement[];
  onElementsChange: (elements: LayerElement[]) => void;
  layerName: string;
}

export function TraitEditor({ elements, onElementsChange, layerName }: TraitEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState<number>(1);

  const totalWeight = elements.reduce((sum, el) => sum + el.weight, 0);

  const calculatePercentage = (weight: number) => {
    if (totalWeight === 0) return 0;
    return ((weight / totalWeight) * 100).toFixed(2);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditWeight(elements[index].weight);
  };

  const handleSave = (index: number) => {
    if (editWeight < 1) {
      alert('Rarity weight must be at least 1');
      return;
    }
    const newElements = [...elements];
    newElements[index] = {
      ...newElements[index],
      weight: editWeight,
    };
    onElementsChange(newElements);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (elements.length <= 1) {
      alert('Cannot delete the last trait. Each layer must have at least one trait.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${elements[index].name}"?`)) {
      const newElements = elements.filter((_, i) => i !== index);
      // Reindex elements
      const reindexed = newElements.map((el, i) => ({ ...el, id: i }));
      onElementsChange(reindexed);
    }
  };

  if (elements.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
        No traits loaded. Upload images to see traits.
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Traits for {layerName}</CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Weight: {totalWeight} | Total Traits: {elements.length}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {elements.map((element, index) => (
            <div
              key={element.id}
              className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {element.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({element.filename})
                  </span>
                </div>
                {editingIndex === index ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor={`weight-${index}`} className="text-xs whitespace-nowrap">
                      Weight:
                    </Label>
                    <Input
                      id={`weight-${index}`}
                      type="number"
                      min="1"
                      value={editWeight}
                      onChange={(e) => setEditWeight(parseInt(e.target.value) || 1)}
                      className="w-20 h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(index)}
                      className="h-8"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingIndex(null)}
                      className="h-8"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Weight: </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {element.weight}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Rarity: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {calculatePercentage(element.weight)}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${calculatePercentage(element.weight)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {editingIndex !== index && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(index)}
                      className="h-8 w-8 p-0"
                      title="Edit rarity"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(index)}
                      className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      title="Delete trait"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Lower weight = rarer trait. Higher weight = more common trait.
            The percentage shows the expected occurrence rate in your collection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

