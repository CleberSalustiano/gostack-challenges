import { Router } from 'express';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import { getCustomRepository, getRepository } from 'typeorm';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
import uploadConfig from '../config/upload';
import Category from '../models/Category';
import Transaction from "../models/Transaction"

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const categoryRepository = getRepository(Category);

  const typeTransaction = await transactionsRepository.find();
  let transactions = new Array<Transaction>;
  for (let transaction  of typeTransaction){
    const category = await categoryRepository.findOne({where: {id: transaction.category_id}})
    if (category instanceof Category) {
      transaction.category = category
    }
    transactions.push(transaction)
  }

  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionsRepository.getBalance();

    if (type !== 'income' && type !== 'outcome') {
      throw Error('This transaction is not correct.');
    }

    if (type === 'outcome' && total < value) {
      throw Error(
        'This transaction is not possible because do not have enough money',
      );
    }

    const createTransaction = new CreateTransactionService();

    const transaction = await createTransaction.execute({
      title,
      value,
      type,
      category_title: category,
    });

    return response.json(transaction);
  } catch (err) {
    if (err instanceof Error) {
      return response.status(400).json({ error: err.message });
    }
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const deleteTransaction = new DeleteTransactionService();

    const { id } = request.params;

    await deleteTransaction.execute(id);

    return response.status(204).json();
  } catch (err) {
    if (err instanceof Error) {
      return response.status(400).json({ error: err.message });
    }
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    try {
      const importTransaction = new ImportTransactionsService();
      const transactions = await importTransaction.execute(request.file.path);

      return response.json(transactions)
    } catch (err) {
      if (err instanceof Error) {
        return response.status(400).json({ error: err.message });
      }
    }
  },
);

export default transactionsRouter;
